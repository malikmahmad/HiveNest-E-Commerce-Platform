"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomeData = exports.uploadProductImages = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.searchProducts = exports.getProduct = exports.getProducts = void 0;
const slugify_1 = __importDefault(require("slugify"));
const prisma_1 = __importDefault(require("../config/prisma"));
const apiResponse_1 = require("../utils/apiResponse");
const cloudinary_1 = require("../utils/cloudinary");
// ─── GET PRODUCTS (with filters, pagination, search) ─────────
const getProducts = async (req, res) => {
    const { page = '1', limit = '12', category, subCategory, brand, minPrice, maxPrice, rating, search, sort = 'newest', featured, newArrival, bestSeller, trending, flashSale, } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const where = { isActive: true };
    if (category) {
        const cat = await prisma_1.default.category.findFirst({ where: { slug: category } });
        if (cat)
            where.categoryId = cat.id;
    }
    if (subCategory) {
        const sub = await prisma_1.default.subCategory.findFirst({ where: { slug: subCategory } });
        if (sub)
            where.subCategoryId = sub.id;
    }
    if (brand)
        where.brand = { contains: brand };
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice)
            where.price.gte = parseFloat(minPrice);
        if (maxPrice)
            where.price.lte = parseFloat(maxPrice);
    }
    if (rating)
        where.avgRating = { gte: parseFloat(rating) };
    if (featured === 'true')
        where.isFeatured = true;
    if (newArrival === 'true')
        where.isNewArrival = true;
    if (bestSeller === 'true')
        where.isBestSeller = true;
    if (trending === 'true')
        where.isTrending = true;
    if (flashSale === 'true') {
        where.isFlashSale = true;
        where.flashSaleEnd = { gt: new Date() };
    }
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { brand: { contains: search } },
            { tags: { contains: search } },
        ];
    }
    const orderBy = sort === 'price-low' ? { price: 'asc' }
        : sort === 'price-high' ? { price: 'desc' }
            : sort === 'rating' ? { avgRating: 'desc' }
                : sort === 'popular' ? { totalSold: 'desc' }
                    : { createdAt: 'desc' };
    const [products, total] = await Promise.all([
        prisma_1.default.product.findMany({
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
        prisma_1.default.product.count({ where }),
    ]);
    apiResponse_1.ApiResponse.paginated(res, products, total, pageNum, limitNum);
};
exports.getProducts = getProducts;
// ─── GET SINGLE PRODUCT ───────────────────────────────────────
const getProduct = async (req, res) => {
    const { slug } = req.params;
    const product = await prisma_1.default.product.findUnique({
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
    if (!product || !product.isActive)
        throw new apiResponse_1.AppError('Product not found', 404);
    // Increment view count
    await prisma_1.default.product.update({
        where: { id: product.id },
        data: { viewCount: { increment: 1 } },
    });
    // Related products
    const related = await prisma_1.default.product.findMany({
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
    apiResponse_1.ApiResponse.success(res, { product, related });
};
exports.getProduct = getProduct;
// ─── SEARCH PRODUCTS ─────────────────────────────────────────
const searchProducts = async (req, res) => {
    const { q, limit = '8' } = req.query;
    if (!q)
        return apiResponse_1.ApiResponse.success(res, []);
    const products = await prisma_1.default.product.findMany({
        where: {
            isActive: true,
            OR: [
                { name: { contains: q } },
                { brand: { contains: q } },
                { tags: { contains: q } },
            ],
        },
        take: parseInt(limit),
        include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { name: true, slug: true } },
        },
    });
    apiResponse_1.ApiResponse.success(res, products);
};
exports.searchProducts = searchProducts;
// ─── CREATE PRODUCT (Admin) ───────────────────────────────────
const createProduct = async (req, res) => {
    const { stock, imageUrl, ...data } = req.body;
    const slug = (0, slugify_1.default)(data.name, { lower: true, strict: true });
    const product = await prisma_1.default.product.create({
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
    apiResponse_1.ApiResponse.created(res, product);
};
exports.createProduct = createProduct;
// ─── UPDATE PRODUCT (Admin) ───────────────────────────────────
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { stock, imageUrl, ...data } = req.body;
    const product = await prisma_1.default.product.findUnique({ where: { id } });
    if (!product)
        throw new apiResponse_1.AppError('Product not found', 404);
    const updated = await prisma_1.default.$transaction(async (tx) => {
        const p = await tx.product.update({
            where: { id },
            data: {
                ...data,
                price: data.price ? parseFloat(data.price) : undefined,
                comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : undefined,
                slug: data.name ? (0, slugify_1.default)(data.name, { lower: true, strict: true }) : undefined,
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
            }
            else {
                await tx.productImage.create({ data: { productId: id, url: imageUrl, isPrimary: true, sortOrder: 0 } });
            }
        }
        return p;
    });
    apiResponse_1.ApiResponse.success(res, updated, 'Product updated');
};
exports.updateProduct = updateProduct;
// ─── DELETE PRODUCT (Admin) ───────────────────────────────────
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const product = await prisma_1.default.product.findUnique({
        where: { id },
        include: { images: true },
    });
    if (!product)
        throw new apiResponse_1.AppError('Product not found', 404);
    // Delete cloudinary images
    await Promise.all(product.images
        .filter(img => img.publicId)
        .map(img => (0, cloudinary_1.deleteImage)(img.publicId)));
    await prisma_1.default.product.delete({ where: { id } });
    apiResponse_1.ApiResponse.success(res, null, 'Product deleted');
};
exports.deleteProduct = deleteProduct;
// ─── UPLOAD PRODUCT IMAGES ────────────────────────────────────
const uploadProductImages = async (req, res) => {
    const { id } = req.params;
    const files = req.files;
    if (!files?.length)
        throw new apiResponse_1.AppError('No files uploaded', 400);
    const product = await prisma_1.default.product.findUnique({ where: { id } });
    if (!product)
        throw new apiResponse_1.AppError('Product not found', 404);
    const existing = await prisma_1.default.productImage.count({ where: { productId: id } });
    const uploads = await Promise.all(files.map((file, i) => (0, cloudinary_1.uploadImage)(file.path, 'hivenest/products').then(result => ({
        productId: id,
        url: result.url,
        publicId: result.publicId,
        isPrimary: existing === 0 && i === 0,
        sortOrder: existing + i,
    }))));
    const images = await prisma_1.default.productImage.createMany({ data: uploads });
    apiResponse_1.ApiResponse.created(res, images, 'Images uploaded');
};
exports.uploadProductImages = uploadProductImages;
// ─── HOME PAGE DATA ───────────────────────────────────────────
const getHomeData = async (req, res) => {
    const imageInclude = {
        images: { where: { isPrimary: true }, take: 1 },
        inventory: { select: { stock: true } },
        category: { select: { name: true, slug: true } },
    };
    const [featured, bestSellers, newArrivals, trending, flashSale, categories] = await Promise.all([
        prisma_1.default.product.findMany({ where: { isActive: true, isFeatured: true }, take: 8, include: imageInclude }),
        prisma_1.default.product.findMany({ where: { isActive: true, isBestSeller: true }, take: 8, include: imageInclude }),
        prisma_1.default.product.findMany({ where: { isActive: true, isNewArrival: true }, take: 8, include: imageInclude, orderBy: { createdAt: 'desc' } }),
        prisma_1.default.product.findMany({ where: { isActive: true, isTrending: true }, take: 8, include: imageInclude }),
        prisma_1.default.product.findMany({
            where: { isActive: true, isFlashSale: true, flashSaleEnd: { gt: new Date() } },
            take: 6,
            include: imageInclude,
        }),
        prisma_1.default.category.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: { _count: { select: { products: true } } },
        }),
    ]);
    apiResponse_1.ApiResponse.success(res, { featured, bestSellers, newArrivals, trending, flashSale, categories });
};
exports.getHomeData = getHomeData;
//# sourceMappingURL=product.controller.js.map