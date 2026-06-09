"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.notFound = exports.errorHandler = void 0;
const zod_1 = require("zod");
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error(err);
    // Zod validation error
    if (err instanceof zod_1.ZodError) {
        const errors = err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }
    // Prisma errors
    if (err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'field';
        return res.status(409).json({
            success: false,
            message: `${field} already exists`,
        });
    }
    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            message: 'Record not found',
        });
    }
    // Operational errors
    if (err instanceof apiResponse_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
    }
    // Unknown
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
const notFound = (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};
exports.notFound = notFound;
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=errorHandler.js.map