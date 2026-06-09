"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorySchema = exports.blogSchema = exports.couponSchema = exports.reviewSchema = exports.orderSchema = exports.cartItemSchema = exports.productSchema = exports.addressSchema = exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// ─── AUTH ─────────────────────────────────────────────────────
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain uppercase')
        .regex(/[0-9]/, 'Must contain a number'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1, 'Password required'),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    password: zod_1.z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});
// ─── ADDRESS ─────────────────────────────────────────────────
exports.addressSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(50),
    phone: zod_1.z.string().min(10).max(15),
    street: zod_1.z.string().min(5).max(200),
    city: zod_1.z.string().min(2).max(50),
    state: zod_1.z.string().min(2).max(50),
    zip: zod_1.z.string().min(4).max(10),
    country: zod_1.z.string().min(2).max(50).default('Pakistan'),
    isDefault: zod_1.z.boolean().optional(),
});
// ─── PRODUCT ─────────────────────────────────────────────────
exports.productSchema = zod_1.z.object({
    categoryId: zod_1.z.string().cuid(),
    subCategoryId: zod_1.z.string().cuid().optional(),
    name: zod_1.z.string().min(3).max(200),
    description: zod_1.z.string().min(10),
    shortDesc: zod_1.z.string().max(500).optional(),
    brand: zod_1.z.string().max(100).optional(),
    price: zod_1.z.number().positive(),
    comparePrice: zod_1.z.number().positive().optional(),
    costPrice: zod_1.z.number().positive().optional(),
    discount: zod_1.z.number().min(0).max(100).default(0),
    weight: zod_1.z.number().positive().optional(),
    isFeatured: zod_1.z.boolean().default(false),
    isNewArrival: zod_1.z.boolean().default(false),
    isBestSeller: zod_1.z.boolean().default(false),
    isTrending: zod_1.z.boolean().default(false),
    isFlashSale: zod_1.z.boolean().default(false),
    flashSaleEnd: zod_1.z.string().datetime().optional(),
    metaTitle: zod_1.z.string().max(60).optional(),
    metaDesc: zod_1.z.string().max(160).optional(),
    tags: zod_1.z.string().optional(),
    stock: zod_1.z.number().int().min(0).default(0),
});
// ─── CART ─────────────────────────────────────────────────────
exports.cartItemSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid(),
    variantId: zod_1.z.string().cuid().optional(),
    quantity: zod_1.z.number().int().min(1).max(100),
});
// ─── ORDER ───────────────────────────────────────────────────
exports.orderSchema = zod_1.z.object({
    addressId: zod_1.z.string().cuid(),
    paymentMethod: zod_1.z.enum(['STRIPE', 'JAZZCASH', 'EASYPAISA', 'COD']),
    couponCode: zod_1.z.string().optional(),
    notes: zod_1.z.string().max(500).optional(),
});
// ─── REVIEW ──────────────────────────────────────────────────
exports.reviewSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid(),
    rating: zod_1.z.number().int().min(1).max(5),
    title: zod_1.z.string().max(100).optional(),
    comment: zod_1.z.string().max(1000).optional(),
});
// ─── COUPON ──────────────────────────────────────────────────
exports.couponSchema = zod_1.z.object({
    code: zod_1.z.string().min(3).max(20).toUpperCase(),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
    value: zod_1.z.number().positive(),
    minOrder: zod_1.z.number().positive().optional(),
    maxDiscount: zod_1.z.number().positive().optional(),
    usageLimit: zod_1.z.number().int().positive().optional(),
    isActive: zod_1.z.boolean().default(true),
    expiresAt: zod_1.z.string().datetime().optional(),
});
// ─── BLOG ────────────────────────────────────────────────────
exports.blogSchema = zod_1.z.object({
    categoryId: zod_1.z.string().cuid(),
    title: zod_1.z.string().min(5).max(200),
    excerpt: zod_1.z.string().max(500).optional(),
    content: zod_1.z.string().min(100),
    author: zod_1.z.string().max(100).default('HiveNest Team'),
    tags: zod_1.z.string().optional(),
    metaTitle: zod_1.z.string().max(60).optional(),
    metaDesc: zod_1.z.string().max(160).optional(),
    isPublished: zod_1.z.boolean().default(true),
});
// ─── CATEGORY ────────────────────────────────────────────────
exports.categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    description: zod_1.z.string().optional(),
    image: zod_1.z.string().url().optional(),
    icon: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().default(true),
    sortOrder: zod_1.z.number().int().default(0),
});
//# sourceMappingURL=schemas.js.map