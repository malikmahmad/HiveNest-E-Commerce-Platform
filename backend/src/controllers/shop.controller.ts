import { Response } from 'express';
import prisma from '../config/prisma';
import { ApiResponse, AppError } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';
import { sendOrderConfirmationEmail } from '../utils/email';

export const getCart = async (req: AuthRequest, res: Response) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user!.userId },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          inventory: { select: { stock: true } },
        },
      },
      variant: true,
    },
  });

  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  ApiResponse.success(res, { items, subtotal, count: items.length });
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  const { productId, variantId, quantity } = req.body;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: true },
  });
  if (!product || !product.isActive) throw new AppError('Product not found', 404);

  const stock = product.inventory?.stock ?? 0;
  if (stock < quantity) throw new AppError(`Only ${stock} items in stock`, 400);

  const existing = await prisma.cartItem.findFirst({
    where: { userId: req.user!.userId, productId, variantId: variantId ?? null },
  });

  let item;
  if (existing) {
    item = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: { increment: quantity } },
      include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
    });
  } else {
    item = await prisma.cartItem.create({
      data: { userId: req.user!.userId, productId, variantId: variantId ?? null, quantity },
      include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
    });
  }

  ApiResponse.success(res, item, 'Added to cart');
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id, userId: req.user!.userId } });
    return ApiResponse.success(res, null, 'Item removed');
  }

  const item = await prisma.cartItem.update({ where: { id, userId: req.user!.userId }, data: { quantity } });
  ApiResponse.success(res, item, 'Cart updated');
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  await prisma.cartItem.delete({ where: { id: req.params.id, userId: req.user!.userId } });
  ApiResponse.success(res, null, 'Removed from cart');
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });
  ApiResponse.success(res, null, 'Cart cleared');
};

export const getWishlist = async (req: AuthRequest, res: Response) => {
  const items = await prisma.wishlist.findMany({
    where: { userId: req.user!.userId },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          inventory: { select: { stock: true } },
          category: { select: { name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  ApiResponse.success(res, items);
};

export const toggleWishlist = async (req: AuthRequest, res: Response) => {
  const { productId } = req.body;

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: req.user!.userId, productId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    return ApiResponse.success(res, { wishlisted: false }, 'Removed from wishlist');
  }

  await prisma.wishlist.create({ data: { userId: req.user!.userId, productId } });
  ApiResponse.success(res, { wishlisted: true }, 'Added to wishlist');
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { addressId, paymentMethod, couponCode, notes } = req.body;
  const userId = req.user!.userId;

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { inventory: true } }, variant: true },
  });

  if (!cartItems.length) throw new AppError('Cart is empty', 400);

  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new AppError('Address not found', 404);

  let subtotal = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  let discount = 0;

  if (couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: { code: couponCode, isActive: true, expiresAt: { gt: new Date() } },
    });
    if (coupon) {
      const minOk = !coupon.minOrder || subtotal >= Number(coupon.minOrder);
      if (!minOk) throw new AppError(`Minimum order $${coupon.minOrder} required`, 400);
      discount = coupon.type === 'PERCENTAGE'
        ? (subtotal * Number(coupon.value)) / 100
        : Number(coupon.value);
      if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
      await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    }
  }

  const shipping = subtotal > 100 ? 0 : 5;
  const tax = (subtotal - discount) * 0.0;
  const total = subtotal - discount + shipping + tax;
  const orderNumber = `HN-${Date.now()}`;

  const order = await prisma.$transaction(async (tx) => {
    const ord = await tx.order.create({
      data: {
        userId,
        addressId,
        orderNumber,
        paymentMethod: paymentMethod as any,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        couponCode,
        notes,
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            name: item.product.name,
            image: '',
            price: item.product.price,
            quantity: item.quantity,
            total: Number(item.product.price) * item.quantity,
            variant: item.variant?.name,
          })),
        },
        payment: {
          create: { amount: total, method: paymentMethod as any, status: 'PENDING' },
        },
      },
      include: { items: true, address: true },
    });

    for (const item of cartItems) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { userId } });
    return ord;
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    sendOrderConfirmationEmail(
      user.email, user.name, order.orderNumber, total,
      cartItems.map(i => ({ name: i.product.name, quantity: i.quantity, price: Number(i.product.price) }))
    ).catch(() => {});
  }

  ApiResponse.created(res, order, 'Order placed successfully');
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '10' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: req.user!.userId },
      include: { items: { take: 2 }, address: true, payment: true },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.order.count({ where: { userId: req.user!.userId } }),
  ]);

  ApiResponse.paginated(res, orders, total, pageNum, limitNum);
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
    include: { items: true, address: true, payment: true },
  });
  if (!order) throw new AppError('Order not found', 404);
  ApiResponse.success(res, order);
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
  if (!order) throw new AppError('Order not found', 404);
  if (!['PENDING', 'PROCESSING'].includes(order.status)) throw new AppError('Order cannot be cancelled', 400);

  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: req.body.reason },
  });

  ApiResponse.success(res, null, 'Order cancelled');
};

export const addReview = async (req: AuthRequest, res: Response) => {
  const { productId, rating, title, comment } = req.body;
  const userId = req.user!.userId;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);

  const review = await prisma.$transaction(async (tx) => {
    const r = await tx.review.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId, rating, title, comment },
      update: { rating, title, comment },
    });

    const stats = await tx.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.product.update({
      where: { id: productId },
      data: { avgRating: stats._avg.rating ?? 0, totalReviews: stats._count.rating },
    });

    return r;
  });

  ApiResponse.success(res, review, 'Review submitted');
};

export const getProductReviews = async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const { page = '1' } = req.query;
  const pageNum = parseInt(page as string);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId, isApproved: true },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * 10,
      take: 10,
    }),
    prisma.review.count({ where: { productId, isApproved: true } }),
  ]);

  ApiResponse.paginated(res, reviews, total, pageNum, 10);
};

export const validateCoupon = async (req: AuthRequest, res: Response) => {
  const { code, subtotal } = req.body;

  const coupon = await prisma.coupon.findFirst({
    where: {
      code: code.toUpperCase(),
      isActive: true,
      AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }],
    },
  });

  if (!coupon) throw new AppError('Invalid or expired coupon', 400);
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
    throw new AppError('Coupon usage limit reached', 400);
  if (coupon.minOrder && subtotal < Number(coupon.minOrder))
    throw new AppError(`Minimum order $${coupon.minOrder} required`, 400);

  let discount = coupon.type === 'PERCENTAGE'
    ? (subtotal * Number(coupon.value)) / 100
    : Number(coupon.value);

  if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));

  ApiResponse.success(res, { coupon, discount });
};
