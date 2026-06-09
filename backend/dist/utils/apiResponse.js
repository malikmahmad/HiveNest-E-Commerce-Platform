"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.ApiResponse = void 0;
class ApiResponse {
    static success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }
    static created(res, data, message = 'Created successfully') {
        return this.success(res, data, message, 201);
    }
    static error(res, message, statusCode = 400, errors) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors: errors || null,
        });
    }
    static paginated(res, data, total, page, limit, message = 'Success') {
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
exports.ApiResponse = ApiResponse;
class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=apiResponse.js.map