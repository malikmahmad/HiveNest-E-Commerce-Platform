import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { ApiResponse, AppError } from '../utils/apiResponse';

export const getBlogs = async (req: Request, res: Response) => {
  const { page = '1', limit = '9', category, search } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const where: any = { isPublished: true };
  if (category) {
    const cat = await prisma.blogCategory.findFirst({ where: { slug: category as string } });
    if (cat) where.categoryId = cat.id;
  }
  if (search) {
    where.OR = [
      { title: { contains: search as string } },
      { excerpt: { contains: search as string } },
      { tags: { contains: search as string } },
    ];
  }

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
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
    prisma.blog.count({ where }),
  ]);

  ApiResponse.paginated(res, blogs, total, pageNum, limitNum);
};

export const getBlog = async (req: Request, res: Response) => {
  const { slug } = req.params;

  const blog = await prisma.blog.findUnique({
    where: { slug, isPublished: true },
    include: { category: true },
  });
  if (!blog) throw new AppError('Blog post not found', 404);

  await prisma.blog.update({ where: { id: blog.id }, data: { viewCount: { increment: 1 } } });

  const related = await prisma.blog.findMany({
    where: { categoryId: blog.categoryId, id: { not: blog.id }, isPublished: true },
    take: 3,
    select: { id: true, title: true, slug: true, image: true, publishedAt: true, excerpt: true },
  });

  ApiResponse.success(res, { blog, related });
};

export const getBlogCategories = async (req: Request, res: Response) => {
  const categories = await prisma.blogCategory.findMany({
    include: { _count: { select: { blogs: true } } },
  });
  ApiResponse.success(res, categories);
};
