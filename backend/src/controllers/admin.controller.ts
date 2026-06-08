import { Request, Response } from 'express';
import slugify from 'slugify';
import prisma from '../config/prisma';
import { ApiResponse, AppError } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

// ─── DASHBOARD ANALYTICS ─────────────────────────────────────
export const getDashboard = async (req: Request, res: Response) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalRevenue, monthRevenue, lastMonthRevenue,
    totalOrders, monthOrders,
    totalUsers, monthUsers,
    totalProducts, lowStock,
    recentOrders, topProducts,
    ordersByStatus,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID', createdAt: { gte: startOfMonth } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({ where: { role: 'USER', createdAt: { gte: startOfMonth } } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.inventory.count({ where: { stock: { lte: prisma.inventory.fields.lowStock } } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, items: { take: 1 } },
    }),
    prisma.product.findMany({
      orderBy: { totalSold: 'desc' },
      take: 5,
      include: { images: { where: { isPrimary: true }, take: 1 } },
    }),
    prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
  ]);

  const revenueGrowth = lastMonthRevenue._sum.total
    ? (((Number(monthRevenue._sum.total) - Number(lastMonthRevenue._sum.total)) / Number(lastMonthRevenue._sum.total)) * 100).toFixed(1)
    : 0;

  ApiResponse.success(res, {
    stats: {
      totalRevenue: Number(totalRevenue._sum.total) || 0,
      monthRevenue: Number(monthRevenue._sum.total) || 0,
      revenueGrowth,
      totalOrders,
      monthOrders,
      totalUsers,
      monthUsers,
      totalProducts,
      lowStock,
    },
    recentOrders,
    topProducts,
    ordersByStatus,
  });
};

// ─── ORDERS MANAGEMENT ───────────────────────────────────────
export const adminGetOrders = async (req: Request, res: Response) => {
  const { page = '1', limit = '20', status, search } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search as string } },
      { user: { name: { contains: search as string } } },
      { user: { email: { contains: search as string } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: { take: 2 },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.order.count({ where }),
  ]);

  ApiResponse.paginated(res, orders, total, pageNum, limitNum);
};

export const adminUpdateOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, paymentStatus, trackingNumber } = req.body;

  const data: any = {};
  if (status !== undefined) {
    data.status = status;
    if (status === 'DELIVERED') data.deliveredAt = new Date();
  }
  if (paymentStatus !== undefined) {
    data.paymentStatus = paymentStatus;
    // Also update the related Payment record
    await prisma.payment.updateMany({
      where: { orderId: id },
      data: {
        status: paymentStatus,
        ...(paymentStatus === 'PAID' ? { paidAt: new Date() } : {}),
      },
    });
  }
  if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;

  const order = await prisma.order.update({ where: { id }, data });
  ApiResponse.success(res, order, 'Order updated');
};

// ─── USERS MANAGEMENT ────────────────────────────────────────
export const adminGetUsers = async (req: Request, res: Response) => {
  const { page = '1', limit = '20', search, role } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { email: { contains: search as string } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true,
        isActive: true, isEmailVerified: true, createdAt: true, lastLogin: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.user.count({ where }),
  ]);

  ApiResponse.paginated(res, users, total, pageNum, limitNum);
};

export const adminUpdateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive, role } = req.body;
  const user = await prisma.user.update({
    where: { id },
    data: { isActive, role },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  ApiResponse.success(res, user, 'User updated');
};

// ─── CATEGORY MANAGEMENT ─────────────────────────────────────
export const adminGetCategories = async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    include: {
      subCategories: true,
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: 'asc' },
  });
  ApiResponse.success(res, categories);
};

export const adminCreateCategory = async (req: Request, res: Response) => {
  const { name, description, image, icon, isActive, sortOrder } = req.body;
  const slug = slugify(name, { lower: true, strict: true });
  const cat = await prisma.category.create({ data: { name, slug, description, image, icon, isActive, sortOrder } });
  ApiResponse.created(res, cat);
};

export const adminUpdateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, ...rest } = req.body;
  const data: any = { ...rest };
  if (name) { data.name = name; data.slug = slugify(name, { lower: true, strict: true }); }
  const cat = await prisma.category.update({ where: { id }, data });
  ApiResponse.success(res, cat, 'Category updated');
};

export const adminDeleteCategory = async (req: Request, res: Response) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  ApiResponse.success(res, null, 'Category deleted');
};

// ─── COUPON MANAGEMENT ───────────────────────────────────────
export const adminGetCoupons = async (req: Request, res: Response) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  ApiResponse.success(res, coupons);
};

export const adminCreateCoupon = async (req: Request, res: Response) => {
  const coupon = await prisma.coupon.create({ data: req.body });
  ApiResponse.created(res, coupon);
};

export const adminUpdateCoupon = async (req: Request, res: Response) => {
  const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data: req.body });
  ApiResponse.success(res, coupon, 'Coupon updated');
};

export const adminDeleteCoupon = async (req: Request, res: Response) => {
  await prisma.coupon.delete({ where: { id: req.params.id } });
  ApiResponse.success(res, null, 'Coupon deleted');
};

// ─── BLOG MANAGEMENT ─────────────────────────────────────────
export const adminGetBlogs = async (req: Request, res: Response) => {
  const { page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.blog.count(),
  ]);
  ApiResponse.paginated(res, blogs, total, pageNum, limitNum);
};

export const adminCreateBlog = async (req: Request, res: Response) => {
  const { title, ...rest } = req.body;
  const slug = slugify(title, { lower: true, strict: true });
  const blog = await prisma.blog.create({ data: { title, slug, ...rest }, include: { category: true } });
  ApiResponse.created(res, blog);
};

export const adminUpdateBlog = async (req: Request, res: Response) => {
  const { title, ...rest } = req.body;
  const data: any = { ...rest };
  if (title) { data.title = title; data.slug = slugify(title, { lower: true, strict: true }); }
  const blog = await prisma.blog.update({ where: { id: req.params.id }, data, include: { category: true } });
  ApiResponse.success(res, blog, 'Blog updated');
};

export const adminDeleteBlog = async (req: Request, res: Response) => {
  await prisma.blog.delete({ where: { id: req.params.id } });
  ApiResponse.success(res, null, 'Blog deleted');
};

// ─── INVENTORY MANAGEMENT ────────────────────────────────────
export const adminGetInventory = async (req: Request, res: Response) => {
  const inventory = await prisma.inventory.findMany({
    include: {
      product: {
        select: { id: true, name: true, sku: true, images: { where: { isPrimary: true }, take: 1 } },
      },
    },
    orderBy: { stock: 'asc' },
  });
  ApiResponse.success(res, inventory);
};

export const adminUpdateInventory = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { stock } = req.body;
  const inv = await prisma.inventory.update({ where: { productId }, data: { stock } });
  ApiResponse.success(res, inv, 'Stock updated');
};
