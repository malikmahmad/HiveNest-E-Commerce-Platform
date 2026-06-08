import { Request, Response } from 'express';
import slugify from 'slugify';
import prisma from '../config/prisma';
import { ApiResponse, AppError } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';
import { uploadImage, deleteImage } from '../utils/cloudinary';

// ─── GET PRODUCTS (with filters, pagination, search) ─────────
export const getProducts = async (req: Request, res: Response) => {
  const {
    page = '1', limit = '12', category, subCategory, brand,
    minPrice, maxPrice, rating, search, sort = 'newest',
    featured, newArrival, bestSeller, trending, flashSale,
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { isActive: true };

  if (category) {
    const cat = await prisma.category.findFirst({ where: { slug: category as string } });
    if (cat) where.categoryId = cat.id;
  }
  if (subCategory) {
    const sub = await prisma.subCategory.findFirst({ where: { slug: subCategory as string } });
    if (sub) where.subCategoryId = sub.id;
  }
  if (brand) where.brand = { contains: brand as string };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice as string);
    if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
  }
  if (rating) where.avgRating = { gte: parseFloat(rating as string) };
  if (featured === 'true') where.isFeatured = true;
  if (newArrival === 'true') where.isNewArrival = true;
  if (bestSeller === 'true') where.isBestSeller = true;
  if (trending === 'true') where.isTrending = true;
  if (flashSale === 'true') {
    where.isFlashSale = true;
    where.flashSaleEnd = { gt: new Date() };
  }
  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { brand: { contains: search as string } },
      { tags: { contains: search as string } },
    ];
  }

  const orderBy: any =
    sort === 'price-low' ? { price: 'asc' }
    : sort === 'price-high' ? { price: 'desc' }
    : sort === 'rating' ? { avgRating: 'desc' }
    : sort === 'popular' ? { totalSold: 'desc' }
    : { createdAt: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
        inventory: { select: { stock: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  ApiResponse.paginated(res, products, total, pageNum, limitNum);
};

// ─── GET SINGLE PRODUCT ───────────────────────────────────────
export const getProduct = async (req: Request, res: Response) => {
  const { slug } = req.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      subCategory: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: true,
      inventory: true,
      reviews: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!product || !product.isActive) throw new AppError('Product not found', 404);

  // Increment view count
  await prisma.product.update({
    where: { id: product.id },
    data: { viewCount: { increment: 1 } },
  });

  // Related products
  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 8,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      inventory: { select: { stock: true } },
    },
  });

  ApiResponse.success(res, { product, related });
};

// ─── SEARCH PRODUCTS ─────────────────────────────────────────
export const searchProducts = async (req: Request, res: Response) => {
  const { q, limit = '8' } = req.query;
  if (!q) return ApiResponse.success(res, []);

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q as string } },
        { brand: { contains: q as string } },
        { tags: { contains: q as string } },
      ],
    },
    take: parseInt(limit as string),
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  });

  ApiResponse.success(res, products);
};

// ─── CREATE PRODUCT (Admin) ───────────────────────────────────
export const createProduct = async (req: AuthRequest, res: Response) => {
  const { stock, imageUrl, ...data } = req.body;

  const slug = slugify(data.name, { lower: true, strict: true });

  const product = await prisma.product.create({
    data: {
      ...data,
      slug,
      price: parseFloat(data.price),
      comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
      inventory: { create: { stock: stock || 0 } },
      // If an image URL is provided, create a primary image record
      ...(imageUrl ? {
        images: { create: { url: imageUrl, isPrimary: true, sortOrder: 0 } },
      } : {}),
    },
    include: { inventory: true, images: true },
  });

  ApiResponse.created(res, product);
};

// ─── UPDATE PRODUCT (Admin) ───────────────────────────────────
export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { stock, imageUrl, ...data } = req.body;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError('Product not found', 404);

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.product.update({
      where: { id },
      data: {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : undefined,
        slug: data.name ? slugify(data.name, { lower: true, strict: true }) : undefined,
      },
    });
    if (stock !== undefined) {
      await tx.inventory.upsert({
        where: { productId: id },
        create: { productId: id, stock },
        update: { stock },
      });
    }
    // Update primary image if URL provided
    if (imageUrl) {
      const existing = await tx.productImage.findFirst({ where: { productId: id, isPrimary: true } });
      if (existing) {
        await tx.productImage.update({ where: { id: existing.id }, data: { url: imageUrl } });
      } else {
        await tx.productImage.create({ data: { productId: id, url: imageUrl, isPrimary: true, sortOrder: 0 } });
      }
    }
    return p;
  });

  ApiResponse.success(res, updated, 'Product updated');
};

// ─── DELETE PRODUCT (Admin) ───────────────────────────────────
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!product) throw new AppError('Product not found', 404);

  // Delete cloudinary images
  await Promise.all(
    product.images
      .filter(img => img.publicId)
      .map(img => deleteImage(img.publicId!))
  );

  await prisma.product.delete({ where: { id } });
  ApiResponse.success(res, null, 'Product deleted');
};

// ─── UPLOAD PRODUCT IMAGES ────────────────────────────────────
export const uploadProductImages = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];

  if (!files?.length) throw new AppError('No files uploaded', 400);

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError('Product not found', 404);

  const existing = await prisma.productImage.count({ where: { productId: id } });

  const uploads = await Promise.all(
    files.map((file, i) =>
      uploadImage(file.path, 'hivenest/products').then(result => ({
        productId: id,
        url: result.url,
        publicId: result.publicId,
        isPrimary: existing === 0 && i === 0,
        sortOrder: existing + i,
      }))
    )
  );

  const images = await prisma.productImage.createMany({ data: uploads });
  ApiResponse.created(res, images, 'Images uploaded');
};

// ─── HOME PAGE DATA ───────────────────────────────────────────
export const getHomeData = async (req: Request, res: Response) => {
  const imageInclude = {
    images: { where: { isPrimary: true }, take: 1 },
    inventory: { select: { stock: true } },
    category: { select: { name: true, slug: true } },
  };

  const [featured, bestSellers, newArrivals, trending, flashSale, categories] =
    await Promise.all([
      prisma.product.findMany({ where: { isActive: true, isFeatured: true }, take: 8, include: imageInclude }),
      prisma.product.findMany({ where: { isActive: true, isBestSeller: true }, take: 8, include: imageInclude }),
      prisma.product.findMany({ where: { isActive: true, isNewArrival: true }, take: 8, include: imageInclude, orderBy: { createdAt: 'desc' } }),
      prisma.product.findMany({ where: { isActive: true, isTrending: true }, take: 8, include: imageInclude }),
      prisma.product.findMany({
        where: { isActive: true, isFlashSale: true, flashSaleEnd: { gt: new Date() } },
        take: 6,
        include: imageInclude,
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
    ]);

  ApiResponse.success(res, { featured, bestSellers, newArrivals, trending, flashSale, categories });
};
