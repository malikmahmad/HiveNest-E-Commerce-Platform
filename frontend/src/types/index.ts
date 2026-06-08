// ─── PRODUCT ─────────────────────────────────────────────────
export interface ProductImage {
  id: string;
  url: string;
  publicId?: string;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  stock: number;
  sku?: string;
  image?: string;
}

export interface Inventory {
  stock: number;
  lowStock: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  _count?: { products: number };
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  sku: string;
  brand?: string;
  price: number;
  comparePrice?: number;
  discount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isFlashSale: boolean;
  flashSaleEnd?: string;
  avgRating: number;
  totalReviews: number;
  totalSold: number;
  viewCount: number;
  metaTitle?: string;
  metaDesc?: string;
  tags?: string;
  createdAt: string;
  category: Category;
  subCategory?: SubCategory;
  images: ProductImage[];
  variants: ProductVariant[];
  inventory?: Inventory;
}

export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  discount: number;
  avgRating: number;
  totalReviews: number;
  brand?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isFlashSale: boolean;
  flashSaleEnd?: string;
  images: ProductImage[];
  inventory?: { stock: number };
  category: { name: string; slug: string };
}

// ─── CART ─────────────────────────────────────────────────────
export interface CartItemType {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: ProductCard;
  variant?: ProductVariant;
}

// ─── ORDER ───────────────────────────────────────────────────
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'STRIPE' | 'JAZZCASH' | 'EASYPAISA' | 'COD';

export interface OrderItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  total: number;
  variant?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  notes?: string;
  trackingNumber?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  items: OrderItem[];
  address: Address;
  payment?: Payment;
}

// ─── ADDRESS ─────────────────────────────────────────────────
export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

// ─── REVIEW ──────────────────────────────────────────────────
export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  createdAt: string;
  user: { name: string; avatar?: string };
}

// ─── PAYMENT ─────────────────────────────────────────────────
export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
}

// ─── BLOG ────────────────────────────────────────────────────
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { blogs: number };
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  author: string;
  tags?: string;
  publishedAt: string;
  viewCount: number;
  category: BlogCategory;
}

// ─── PAGINATION ──────────────────────────────────────────────
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── FILTERS ─────────────────────────────────────────────────
export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  subCategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
  sort?: 'newest' | 'price-low' | 'price-high' | 'rating' | 'popular';
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  trending?: boolean;
  flashSale?: boolean;
}
