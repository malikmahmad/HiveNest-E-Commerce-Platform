import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
  }

  static created<T>(res: Response, data: T, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  static error(res: Response, message: string, statusCode = 400, errors?: unknown) {
    return res.status(statusCode).json({ success: false, message, errors: errors || null });
  }

  static paginated<T>(res: Response, data: T[], total: number, page: number, limit: number, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  }
}

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
