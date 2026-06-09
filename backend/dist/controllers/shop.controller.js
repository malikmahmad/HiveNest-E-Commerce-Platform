"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCoupon = exports.getProductReviews = exports.addReview = exports.cancelOrder = exports.getOrder = exports.getOrders = exports.createOrder = exports.toggleWishlist = exports.getWishlist = exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const apiResponse_1 = require("../utils/apiResponse");
const email_1 = require("../utils/email");
// ══════════════════════════════════════════════════════════════
// CART CONTROLLER
// ══════════════════════════════════════════════════════════════
const getCart = async (req, res) => {
    const items = await prisma_1.default.cartItem.findMany({
        where: { userId: req.user.userId },
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
    apiResponse_1.ApiResponse.success(res, { items, subtotal, count: items.length });
};
exports.getCart = getCart;
const addToCart = async (req, res) => {
    const { productId, variantId, quantity } = req.body;
    const product = await prisma_1.default.product.findUnique({
        where: { id: productId },
        include: { inventory: true },
    });
    if (!product || !product.isActive)
        throw new apiResponse_1.AppError('Product not found', 404);
    const stock = product.inventory?.stock ?? 0;
    if (stock < quantity)
        throw new apiResponse_1.AppError(`Only ${stock} items in stock`, 400);
    // SQLite NULL unique constraint workaround — upsert fails with null variantId
    const existing = await prisma_1.default.cartItem.findFirst({
        where: {
            userId: req.user.userId,
            productId,
            variantId: variantId ?? null,
        },
    });
    let item;
    if (existing) {
        item = await prisma_1.default.cartItem.update({
            where: { id: existing.id },
            data: { quantity: { increment: quantity } },
            include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
        });
    }
    else {
        item = await prisma_1.default.cartItem.create({
            data: {
                userId: req.user.userId,
                productId,
                variantId: variantId ?? null,
                quantity,
            },
            include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
        });
    }
    apiResponse_1.ApiResponse.success(res, item, 'Added to cart');
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    if (quantity <= 0) {
        await prisma_1.default.cartItem.delete({ where: { id, userId: req.user.userId } });
        return apiResponse_1.ApiResponse.success(res, null, 'Item removed');
    }
    const item = await prisma_1.default.cartItem.update({
        where: { id, userId: req.user.userId },
        data: { quantity },
    });
    apiResponse_1.ApiResponse.success(res, item, 'Cart updated');
};
exports.updateCartItem = updateCartItem;
const removeFromCart = async (req, res) => {
    const { id } = req.params;
    await prisma_1.default.cartItem.delete({ where: { id, userId: req.user.userId } });
    apiResponse_1.ApiResponse.success(res, null, 'Removed from cart');
};
exports.removeFromCart = removeFromCart;
const clearCart = async (req, res) => {
    await prisma_1.default.cartItem.deleteMany({ where: { userId: req.user.userId } });
    apiResponse_1.ApiResponse.success(res, null, 'Cart cleared');
};
exports.clearCart = clearCart;
// ══════════════════════════════════════════════════════════════
// WISHLIST CONTROLLER
// ══════════════════════════════════════════════════════════════
const getWishlist = async (req, res) => {
    const items = await prisma_1.default.wishlist.findMany({
        where: { userId: req.user.userId },
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
    apiResponse_1.ApiResponse.success(res, items);
};
exports.getWishlist = getWishlist;
const toggleWishlist = async (req, res) => {
    const { productId } = req.body;
    const existing = await prisma_1.default.wishlist.findUnique({
        where: { userId_productId: { userId: req.user.userId, productId } },
    });
    if (existing) {
        await prisma_1.default.wishlist.delete({ where: { id: existing.id } });
        return apiResponse_1.ApiResponse.success(res, { wishlisted: false }, 'Removed from wishlist');
    }
    await prisma_1.default.wishlist.create({ data: { userId: req.user.userId, productId } });
    apiResponse_1.ApiResponse.success(res, { wishlisted: true }, 'Added to wishlist');
};
exports.toggleWishlist = toggleWishlist;
// ══════════════════════════════════════════════════════════════
// ORDER CONTROLLER
// ══════════════════════════════════════════════════════════════
const createOrder = async (req, res) => {
    const { addressId, paymentMethod, couponCode, notes } = req.body;
    const userId = req.user.userId;
    // Get cart
    const cartItems = await prisma_1.default.cartItem.findMany({
        where: { userId },
        include: {
            product: { include: { inventory: true } },
            variant: true,
        },
    });
    if (!cartItems.length)
        throw new apiResponse_1.AppError('Cart is empty', 400);
    // Verify address
    const address = await prisma_1.default.address.findFirst({ where: { id: addressId, userId } });
    if (!address)
        throw new apiResponse_1.AppError('Address not found', 404);
    // Calculate totals
    let subtotal = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    let discount = 0;
    // Apply coupon
    if (couponCode) {
        const coupon = await prisma_1.default.coupon.findFirst({
            where: { code: couponCode, isActive: true, expiresAt: { gt: new Date() } },
        });
        if (coupon) {
            const minOk = !coupon.minOrder || subtotal >= Number(coupon.minOrder);
            if (!minOk)
                throw new apiResponse_1.AppError(`Minimum order $${coupon.minOrder} required`, 400);
            discount = coupon.type === 'PERCENTAGE'
                ? (subtotal * Number(coupon.value)) / 100
                : Number(coupon.value);
            if (coupon.maxDiscount)
                discount = Math.min(discount, Number(coupon.maxDiscount));
            await prisma_1.default.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
        }
    }
    const shipping = subtotal > 100 ? 0 : 5;
    const tax = (subtotal - discount) * 0.0;
    const total = subtotal - discount + shipping + tax;
    const orderNumber = `HN-${Date.now()}`;
    // Create order in transaction
    const order = await prisma_1.default.$transaction(async (tx) => {
        const ord = await tx.order.create({
            data: {
                userId,
                addressId,
                orderNumber,
                paymentMethod: paymentMethod,
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
                    create: {
                        amount: total,
                        method: paymentMethod,
                        status: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
                    },
                },
            },
            include: { items: true, address: true },
        });
        // Decrement stock
        for (const item of cartItems) {
            await tx.inventory.update({
                where: { productId: item.productId },
                data: { stock: { decrement: item.quantity } },
            });
        }
        // Clear cart
        await tx.cartItem.deleteMany({ where: { userId } });
        return ord;
    });
    // Send confirmation email
    const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (user) {
        await (0, email_1.sendOrderConfirmationEmail)(user.email, user.name, order.orderNumber, total, cartItems.map(i => ({ name: i.product.name, quantity: i.quantity, price: Number(i.product.price) }))).catch(() => { }); // non-blocking
    }
    apiResponse_1.ApiResponse.created(res, order, 'Order placed successfully');
};
exports.createOrder = createOrder;
const getOrders = async (req, res) => {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [orders, total] = await Promise.all([
        prisma_1.default.order.findMany({
            where: { userId: req.user.userId },
            include: {
                items: { take: 2 },
                address: true,
                payment: true,
            },
            orderBy: { createdAt: 'desc' },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
        }),
        prisma_1.default.order.count({ where: { userId: req.user.userId } }),
    ]);
    apiResponse_1.ApiResponse.paginated(res, orders, total, pageNum, limitNum);
};
exports.getOrders = getOrders;
const getOrder = async (req, res) => {
    const order = await prisma_1.default.order.findFirst({
        where: { id: req.params.id, userId: req.user.userId },
        include: { items: true, address: true, payment: true },
    });
    if (!order)
        throw new apiResponse_1.AppError('Order not found', 404);
    apiResponse_1.ApiResponse.success(res, order);
};
exports.getOrder = getOrder;
const cancelOrder = async (req, res) => {
    const order = await prisma_1.default.order.findFirst({
        where: { id: req.params.id, userId: req.user.userId },
    });
    if (!order)
        throw new apiResponse_1.AppError('Order not found', 404);
    if (!['PENDING', 'PROCESSING'].includes(order.status))
        throw new apiResponse_1.AppError('Order cannot be cancelled', 400);
    await prisma_1.default.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: req.body.reason },
    });
    apiResponse_1.ApiResponse.success(res, null, 'Order cancelled');
};
exports.cancelOrder = cancelOrder;
// ══════════════════════════════════════════════════════════════
// REVIEW CONTROLLER
// ══════════════════════════════════════════════════════════════
const addReview = async (req, res) => {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user.userId;
    const product = await prisma_1.default.product.findUnique({ where: { id: productId } });
    if (!product)
        throw new apiResponse_1.AppError('Product not found', 404);
    const review = await prisma_1.default.$transaction(async (tx) => {
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
    apiResponse_1.ApiResponse.success(res, review, 'Review submitted');
};
exports.addReview = addReview;
const getProductReviews = async (req, res) => {
    const { productId } = req.params;
    const { page = '1' } = req.query;
    const pageNum = parseInt(page);
    const [reviews, total] = await Promise.all([
        prisma_1.default.review.findMany({
            where: { productId, isApproved: true },
            include: { user: { select: { name: true, avatar: true } } },
            orderBy: { createdAt: 'desc' },
            skip: (pageNum - 1) * 10,
            take: 10,
        }),
        prisma_1.default.review.count({ where: { productId, isApproved: true } }),
    ]);
    apiResponse_1.ApiResponse.paginated(res, reviews, total, pageNum, 10);
};
exports.getProductReviews = getProductReviews;
// ══════════════════════════════════════════════════════════════
// COUPON CONTROLLER
// ══════════════════════════════════════════════════════════════
const validateCoupon = async (req, res) => {
    const { code, subtotal } = req.body;
    const coupon = await prisma_1.default.coupon.findFirst({
        where: {
            code: code.toUpperCase(),
            isActive: true,
            AND: [
                { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
            ],
        },
    });
    // Check usage limit in application code (Prisma can't compare two columns directly)
    if (!coupon)
        throw new apiResponse_1.AppError('Invalid or expired coupon', 400);
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
        throw new apiResponse_1.AppError('Coupon usage limit reached', 400);
    if (coupon.minOrder && subtotal < Number(coupon.minOrder))
        throw new apiResponse_1.AppError(`Minimum order $${coupon.minOrder} required`, 400);
    let discount = coupon.type === 'PERCENTAGE'
        ? (subtotal * Number(coupon.value)) / 100
        : Number(coupon.value);
    if (coupon.maxDiscount)
        discount = Math.min(discount, Number(coupon.maxDiscount));
    apiResponse_1.ApiResponse.success(res, { coupon, discount });
};
exports.validateCoupon = validateCoupon;
//# sourceMappingURL=shop.controller.js.map