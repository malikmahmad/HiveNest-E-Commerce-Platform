import { Request, Response, NextFunction } from 'express';
import { ZodError, AnyZodObject } from 'zod';
import { AppError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);

  if (err instanceof ZodError) {
    const errors = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  if ((err as any).code === 'P2002') {
    const field = (err as any).meta?.target?.[0] || 'field';
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }

  if ((err as any).code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Record not found' });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  return res.status(500).json({ success: false, message: 'Internal server error' });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
};
