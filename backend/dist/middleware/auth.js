"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.restrictTo = exports.protect = void 0;
const jwt_1 = require("../utils/jwt");
const apiResponse_1 = require("../utils/apiResponse");
const prisma_1 = __importDefault(require("../config/prisma"));
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : req.cookies?.accessToken;
        if (!token)
            throw new apiResponse_1.AppError('Not authenticated. Please login.', 401);
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true, isActive: true },
        });
        if (!user || !user.isActive)
            throw new apiResponse_1.AppError('User not found or deactivated.', 401);
        req.user = { ...decoded, id: user.id };
        next();
    }
    catch (err) {
        if (err instanceof apiResponse_1.AppError)
            return next(err);
        next(new apiResponse_1.AppError('Invalid or expired token.', 401));
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new apiResponse_1.AppError('You do not have permission.', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : req.cookies?.accessToken;
        if (token) {
            const decoded = (0, jwt_1.verifyAccessToken)(token);
            req.user = { ...decoded, id: decoded.userId };
        }
    }
    catch {
        // silent - optional auth
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map