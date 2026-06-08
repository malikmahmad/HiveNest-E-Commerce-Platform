import { z } from 'zod';

// ─── AUTH ─────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain a number'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

// ─── ADDRESS ─────────────────────────────────────────────────
export const addressSchema = z.object({
  name: z.string().min(2).max(50),
  phone: z.string().min(10).max(15),
  street: z.string().min(5).max(200),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  zip: z.string().min(4).max(10),
  country: z.string().min(2).max(50).default('Pakistan'),
  isDefault: z.boolean().optional(),
});

// ─── PRODUCT ─────────────────────────────────────────────────
export const productSchema = z.object({
  categoryId: z.string().cuid(),
  subCategoryId: z.string().cuid().optional(),
  name: z.string().min(3).max(200),
  description: z.string().min(10),
  shortDesc: z.string().max(500).optional(),
  brand: z.string().max(100).optional(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  discount: z.number().min(0).max(100).default(0),
  weight: z.number().positive().optional(),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isFlashSale: z.boolean().default(false),
  flashSaleEnd: z.string().datetime().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDesc: z.string().max(160).optional(),
  tags: z.string().optional(),
  stock: z.number().int().min(0).default(0),
});

// ─── CART ─────────────────────────────────────────────────────
export const cartItemSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  quantity: z.number().int().min(1).max(100),
});

// ─── ORDER ───────────────────────────────────────────────────
export const orderSchema = z.object({
  addressId: z.string().cuid(),
  paymentMethod: z.enum(['STRIPE', 'JAZZCASH', 'EASYPAISA', 'COD']),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// ─── REVIEW ──────────────────────────────────────────────────
export const reviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
});

// ─── COUPON ──────────────────────────────────────────────────
export const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
  value: z.number().positive(),
  minOrder: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().datetime().optional(),
});

// ─── BLOG ────────────────────────────────────────────────────
export const blogSchema = z.object({
  categoryId: z.string().cuid(),
  title: z.string().min(5).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(100),
  author: z.string().max(100).default('HiveNest Team'),
  tags: z.string().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDesc: z.string().max(160).optional(),
  isPublished: z.boolean().default(true),
});

// ─── CATEGORY ────────────────────────────────────────────────
export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  image: z.string().url().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
