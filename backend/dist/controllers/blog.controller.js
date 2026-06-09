"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlogCategories = exports.getBlog = exports.getBlogs = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const apiResponse_1 = require("../utils/apiResponse");
const getBlogs = async (req, res) => {
    const { page = '1', limit = '9', category, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const where = { isPublished: true };
    if (category) {
        const cat = await prisma_1.default.blogCategory.findFirst({ where: { slug: category } });
        if (cat)
            where.categoryId = cat.id;
    }
    if (search) {
        where.OR = [
            { title: { contains: search } },
            { excerpt: { contains: search } },
            { tags: { contains: search } },
        ];
    }
    const [blogs, total] = await Promise.all([
        prisma_1.default.blog.findMany({
            where,
            orderBy: { publishedAt: 'desc' },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            select: {
                id: true, title: true, slug: true, excerpt: true,
                image: true, author: true, publishedAt: true, viewCount: true,
                tags: true,
                category: { select: { name: true, slug: true } },
            },
        }),
        prisma_1.default.blog.count({ where }),
    ]);
    apiResponse_1.ApiResponse.paginated(res, blogs, total, pageNum, limitNum);
};
exports.getBlogs = getBlogs;
const getBlog = async (req, res) => {
    const { slug } = req.params;
    const blog = await prisma_1.default.blog.findUnique({
        where: { slug, isPublished: true },
        include: { category: true },
    });
    if (!blog)
        throw new apiResponse_1.AppError('Blog post not found', 404);
    await prisma_1.default.blog.update({ where: { id: blog.id }, data: { viewCount: { increment: 1 } } });
    const related = await prisma_1.default.blog.findMany({
        where: { categoryId: blog.categoryId, id: { not: blog.id }, isPublished: true },
        take: 3,
        select: { id: true, title: true, slug: true, image: true, publishedAt: true, excerpt: true },
    });
    apiResponse_1.ApiResponse.success(res, { blog, related });
};
exports.getBlog = getBlog;
const getBlogCategories = async (req, res) => {
    const categories = await prisma_1.default.blogCategory.findMany({
        include: { _count: { select: { blogs: true } } },
    });
    apiResponse_1.ApiResponse.success(res, categories);
};
exports.getBlogCategories = getBlogCategories;
//# sourceMappingURL=blog.controller.js.map