import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/apiResponse';
import prisma from '../config/prisma';

export interface AuthRequest extends Request {
  user?: JwtPayload & { id: string };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : req.cookies?.accessToken;

    if (!token) throw new AppError('Not authenticated. Please login.', 401);

    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) throw new AppError('User not found or deactivated.', 401);

    req.user = { ...decoded, id: user.id };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError('Invalid or expired token.', 401));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission.', 403));
    }
    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : req.cookies?.accessToken;

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = { ...decoded, id: decoded.userId };
    }
  } catch {
    // silent
  }
  next();
};
