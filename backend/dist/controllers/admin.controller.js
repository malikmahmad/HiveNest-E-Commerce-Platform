"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateInventory = exports.adminGetInventory = exports.adminDeleteBlog = exports.adminUpdateBlog = exports.adminCreateBlog = exports.adminGetBlogs = exports.adminDeleteCoupon = exports.adminUpdateCoupon = exports.adminCreateCoupon = exports.adminGetCoupons = exports.adminDeleteCategory = exports.adminUpdateCategory = exports.adminCreateCategory = exports.adminGetCategories = exports.adminUpdateUser = exports.adminGetUsers = exports.adminUpdateOrder = exports.adminGetOrders = exports.getDashboard = void 0;
const slugify_1 = __importDefault(require("slugify"));
const prisma_1 = __importDefault(require("../config/prisma"));
const apiResponse_1 = require("../utils/apiResponse");
// ─── DASHBOARD ANALYTICS ─────────────────────────────────────
const getDashboard = async (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const [totalRevenue, monthRevenue, lastMonthRevenue, totalOrders, monthOrders, totalUsers, monthUsers, totalProducts, lowStock, recentOrders, topProducts, ordersByStatus,] = await Promise.all([
        prisma_1.default.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
        prisma_1.default.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID', createdAt: { gte: startOfMonth } } }),
        prisma_1.default.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
        prisma_1.default.order.count(),
        prisma_1.default.order.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma_1.default.user.count({ where: { role: 'USER' } }),
        prisma_1.default.user.count({ where: { role: 'USER', createdAt: { gte: startOfMonth } } }),
        prisma_1.default.product.count({ where: { isActive: true } }),
        prisma_1.default.inventory.count({ where: { stock: { lte: prisma_1.default.inventory.fields.lowStock } } }),
        prisma_1.default.order.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } }, items: { take: 1 } },
        }),
        prisma_1.default.product.findMany({
            orderBy: { totalSold: 'desc' },
            take: 5,
            include: { images: { where: { isPrimary: true }, take: 1 } },
        }),
        prisma_1.default.order.groupBy({ by: ['status'], _count: { status: true } }),
    ]);
    const revenueGrowth = lastMonthRevenue._sum.total
        ? (((Number(monthRevenue._sum.total) - Number(lastMonthRevenue._sum.total)) / Number(lastMonthRevenue._sum.total)) * 100).toFixed(1)
        : 0;
    apiResponse_1.ApiResponse.success(res, {
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
exports.getDashboard = getDashboard;
// ─── ORDERS MANAGEMENT ───────────────────────────────────────
const adminGetOrders = async (req, res) => {
    const { page = '1', limit = '20', status, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const where = {};
    if (status)
        where.status = status;
    if (search) {
        where.OR = [
            { orderNumber: { contains: search } },
            { user: { name: { contains: search } } },
            { user: { email: { contains: search } } },
        ];
    }
    const [orders, total] = await Promise.all([
        prisma_1.default.order.findMany({
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
        prisma_1.default.order.count({ where }),
    ]);
    apiResponse_1.ApiResponse.paginated(res, orders, total, pageNum, limitNum);
};
exports.adminGetOrders = adminGetOrders;
const adminUpdateOrder = async (req, res) => {
    const { id } = req.params;
    const { status, paymentStatus, trackingNumber } = req.body;
    const data = {};
    if (status !== undefined) {
        data.status = status;
        if (status === 'DELIVERED')
            data.deliveredAt = new Date();
    }
    if (paymentStatus !== undefined) {
        data.paymentStatus = paymentStatus;
        // Also update the related Payment record
        await prisma_1.default.payment.updateMany({
            where: { orderId: id },
            data: {
                status: paymentStatus,
                ...(paymentStatus === 'PAID' ? { paidAt: new Date() } : {}),
            },
        });
    }
    if (trackingNumber !== undefined)
        data.trackingNumber = trackingNumber;
    const order = await prisma_1.default.order.update({ where: { id }, data });
    apiResponse_1.ApiResponse.success(res, order, 'Order updated');
};
exports.adminUpdateOrder = adminUpdateOrder;
// ─── USERS MANAGEMENT ────────────────────────────────────────
const adminGetUsers = async (req, res) => {
    const { page = '1', limit = '20', search, role } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const where = {};
    if (role)
        where.role = role;
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { email: { contains: search } },
        ];
    }
    const [users, total] = await Promise.all([
        prisma_1.default.user.findMany({
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
        prisma_1.default.user.count({ where }),
    ]);
    apiResponse_1.ApiResponse.paginated(res, users, total, pageNum, limitNum);
};
exports.adminGetUsers = adminGetUsers;
const adminUpdateUser = async (req, res) => {
    const { id } = req.params;
    const { isActive, role } = req.body;
    const user = await prisma_1.default.user.update({
        where: { id },
        data: { isActive, role },
        select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    apiResponse_1.ApiResponse.success(res, user, 'User updated');
};
exports.adminUpdateUser = adminUpdateUser;
// ─── CATEGORY MANAGEMENT ─────────────────────────────────────
const adminGetCategories = async (req, res) => {
    const categories = await prisma_1.default.category.findMany({
        include: {
            subCategories: true,
            _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
    });
    apiResponse_1.ApiResponse.success(res, categories);
};
exports.adminGetCategories = adminGetCategories;
const adminCreateCategory = async (req, res) => {
    const { name, description, image, icon, isActive, sortOrder } = req.body;
    const slug = (0, slugify_1.default)(name, { lower: true, strict: true });
    const cat = await prisma_1.default.category.create({ data: { name, slug, description, image, icon, isActive, sortOrder } });
    apiResponse_1.ApiResponse.created(res, cat);
};
exports.adminCreateCategory = adminCreateCategory;
const adminUpdateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, ...rest } = req.body;
    const data = { ...rest };
    if (name) {
        data.name = name;
        data.slug = (0, slugify_1.default)(name, { lower: true, strict: true });
    }
    const cat = await prisma_1.default.category.update({ where: { id }, data });
    apiResponse_1.ApiResponse.success(res, cat, 'Category updated');
};
exports.adminUpdateCategory = adminUpdateCategory;
const adminDeleteCategory = async (req, res) => {
    await prisma_1.default.category.delete({ where: { id: req.params.id } });
    apiResponse_1.ApiResponse.success(res, null, 'Category deleted');
};
exports.adminDeleteCategory = adminDeleteCategory;
// ─── COUPON MANAGEMENT ───────────────────────────────────────
const adminGetCoupons = async (req, res) => {
    const coupons = await prisma_1.default.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    apiResponse_1.ApiResponse.success(res, coupons);
};
exports.adminGetCoupons = adminGetCoupons;
const adminCreateCoupon = async (req, res) => {
    const coupon = await prisma_1.default.coupon.create({ data: req.body });
    apiResponse_1.ApiResponse.created(res, coupon);
};
exports.adminCreateCoupon = adminCreateCoupon;
const adminUpdateCoupon = async (req, res) => {
    const coupon = await prisma_1.default.coupon.update({ where: { id: req.params.id }, data: req.body });
    apiResponse_1.ApiResponse.success(res, coupon, 'Coupon updated');
};
exports.adminUpdateCoupon = adminUpdateCoupon;
const adminDeleteCoupon = async (req, res) => {
    await prisma_1.default.coupon.delete({ where: { id: req.params.id } });
    apiResponse_1.ApiResponse.success(res, null, 'Coupon deleted');
};
exports.adminDeleteCoupon = adminDeleteCoupon;
// ─── BLOG MANAGEMENT ─────────────────────────────────────────
const adminGetBlogs = async (req, res) => {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [blogs, total] = await Promise.all([
        prisma_1.default.blog.findMany({
            include: { category: true },
            orderBy: { createdAt: 'desc' },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
        }),
        prisma_1.default.blog.count(),
    ]);
    apiResponse_1.ApiResponse.paginated(res, blogs, total, pageNum, limitNum);
};
exports.adminGetBlogs = adminGetBlogs;
const adminCreateBlog = async (req, res) => {
    const { title, ...rest } = req.body;
    const slug = (0, slugify_1.default)(title, { lower: true, strict: true });
    const blog = await prisma_1.default.blog.create({ data: { title, slug, ...rest }, include: { category: true } });
    apiResponse_1.ApiResponse.created(res, blog);
};
exports.adminCreateBlog = adminCreateBlog;
const adminUpdateBlog = async (req, res) => {
    const { title, ...rest } = req.body;
    const data = { ...rest };
    if (title) {
        data.title = title;
        data.slug = (0, slugify_1.default)(title, { lower: true, strict: true });
    }
    const blog = await prisma_1.default.blog.update({ where: { id: req.params.id }, data, include: { category: true } });
    apiResponse_1.ApiResponse.success(res, blog, 'Blog updated');
};
exports.adminUpdateBlog = adminUpdateBlog;
const adminDeleteBlog = async (req, res) => {
    await prisma_1.default.blog.delete({ where: { id: req.params.id } });
    apiResponse_1.ApiResponse.success(res, null, 'Blog deleted');
};
exports.adminDeleteBlog = adminDeleteBlog;
// ─── INVENTORY MANAGEMENT ────────────────────────────────────
const adminGetInventory = async (req, res) => {
    const inventory = await prisma_1.default.inventory.findMany({
        include: {
            product: {
                select: { id: true, name: true, sku: true, images: { where: { isPrimary: true }, take: 1 } },
            },
        },
        orderBy: { stock: 'asc' },
    });
    apiResponse_1.ApiResponse.success(res, inventory);
};
exports.adminGetInventory = adminGetInventory;
const adminUpdateInventory = async (req, res) => {
    const { productId } = req.params;
    const { stock } = req.body;
    const inv = await prisma_1.default.inventory.update({ where: { productId }, data: { stock } });
    apiResponse_1.ApiResponse.success(res, inv, 'Stock updated');
};
exports.adminUpdateInventory = adminUpdateInventory;
//# sourceMappingURL=admin.controller.js.map