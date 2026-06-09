import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
}, {
    email: string;
    password: string;
    name: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
}, {
    password: string;
    token: string;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const addressSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    street: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    zip: z.ZodString;
    country: z.ZodDefault<z.ZodString>;
    isDefault: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault?: boolean | undefined;
}, {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const productSchema: z.ZodObject<{
    categoryId: z.ZodString;
    subCategoryId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodString;
    shortDesc: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    comparePrice: z.ZodOptional<z.ZodNumber>;
    costPrice: z.ZodOptional<z.ZodNumber>;
    discount: z.ZodDefault<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNumber>;
    isFeatured: z.ZodDefault<z.ZodBoolean>;
    isNewArrival: z.ZodDefault<z.ZodBoolean>;
    isBestSeller: z.ZodDefault<z.ZodBoolean>;
    isTrending: z.ZodDefault<z.ZodBoolean>;
    isFlashSale: z.ZodDefault<z.ZodBoolean>;
    flashSaleEnd: z.ZodOptional<z.ZodString>;
    metaTitle: z.ZodOptional<z.ZodString>;
    metaDesc: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    stock: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    categoryId: string;
    price: number;
    discount: number;
    isFeatured: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
    isTrending: boolean;
    isFlashSale: boolean;
    stock: number;
    brand?: string | undefined;
    tags?: string | undefined;
    subCategoryId?: string | undefined;
    shortDesc?: string | undefined;
    comparePrice?: number | undefined;
    costPrice?: number | undefined;
    weight?: number | undefined;
    flashSaleEnd?: string | undefined;
    metaTitle?: string | undefined;
    metaDesc?: string | undefined;
}, {
    name: string;
    description: string;
    categoryId: string;
    price: number;
    brand?: string | undefined;
    tags?: string | undefined;
    subCategoryId?: string | undefined;
    shortDesc?: string | undefined;
    comparePrice?: number | undefined;
    costPrice?: number | undefined;
    discount?: number | undefined;
    weight?: number | undefined;
    isFeatured?: boolean | undefined;
    isNewArrival?: boolean | undefined;
    isBestSeller?: boolean | undefined;
    isTrending?: boolean | undefined;
    isFlashSale?: boolean | undefined;
    flashSaleEnd?: string | undefined;
    metaTitle?: string | undefined;
    metaDesc?: string | undefined;
    stock?: number | undefined;
}>;
export declare const cartItemSchema: z.ZodObject<{
    productId: z.ZodString;
    variantId: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    productId: string;
    quantity: number;
    variantId?: string | undefined;
}, {
    productId: string;
    quantity: number;
    variantId?: string | undefined;
}>;
export declare const orderSchema: z.ZodObject<{
    addressId: z.ZodString;
    paymentMethod: z.ZodEnum<["STRIPE", "JAZZCASH", "EASYPAISA", "COD"]>;
    couponCode: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    addressId: string;
    paymentMethod: "COD" | "STRIPE" | "JAZZCASH" | "EASYPAISA";
    couponCode?: string | undefined;
    notes?: string | undefined;
}, {
    addressId: string;
    paymentMethod: "COD" | "STRIPE" | "JAZZCASH" | "EASYPAISA";
    couponCode?: string | undefined;
    notes?: string | undefined;
}>;
export declare const reviewSchema: z.ZodObject<{
    productId: z.ZodString;
    rating: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rating: number;
    productId: string;
    title?: string | undefined;
    comment?: string | undefined;
}, {
    rating: number;
    productId: string;
    title?: string | undefined;
    comment?: string | undefined;
}>;
export declare const couponSchema: z.ZodObject<{
    code: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<["PERCENTAGE", "FIXED"]>>;
    value: z.ZodNumber;
    minOrder: z.ZodOptional<z.ZodNumber>;
    maxDiscount: z.ZodOptional<z.ZodNumber>;
    usageLimit: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    expiresAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    value: number;
    code: string;
    type: "PERCENTAGE" | "FIXED";
    description?: string | undefined;
    minOrder?: number | undefined;
    maxDiscount?: number | undefined;
    usageLimit?: number | undefined;
    expiresAt?: string | undefined;
}, {
    value: number;
    code: string;
    isActive?: boolean | undefined;
    description?: string | undefined;
    type?: "PERCENTAGE" | "FIXED" | undefined;
    minOrder?: number | undefined;
    maxDiscount?: number | undefined;
    usageLimit?: number | undefined;
    expiresAt?: string | undefined;
}>;
export declare const blogSchema: z.ZodObject<{
    categoryId: z.ZodString;
    title: z.ZodString;
    excerpt: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
    author: z.ZodDefault<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    metaTitle: z.ZodOptional<z.ZodString>;
    metaDesc: z.ZodOptional<z.ZodString>;
    isPublished: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    categoryId: string;
    title: string;
    content: string;
    author: string;
    isPublished: boolean;
    tags?: string | undefined;
    metaTitle?: string | undefined;
    metaDesc?: string | undefined;
    excerpt?: string | undefined;
}, {
    categoryId: string;
    title: string;
    content: string;
    tags?: string | undefined;
    metaTitle?: string | undefined;
    metaDesc?: string | undefined;
    excerpt?: string | undefined;
    author?: string | undefined;
    isPublished?: boolean | undefined;
}>;
export declare const categorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    sortOrder: number;
    description?: string | undefined;
    image?: string | undefined;
    icon?: string | undefined;
}, {
    name: string;
    isActive?: boolean | undefined;
    description?: string | undefined;
    image?: string | undefined;
    icon?: string | undefined;
    sortOrder?: number | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map