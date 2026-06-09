"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAddress = exports.updateProfile = exports.getMe = exports.resetPassword = exports.forgotPassword = exports.logout = exports.refreshToken = exports.googleLogin = exports.login = exports.verifyEmail = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const google_auth_library_1 = require("google-auth-library");
const prisma_1 = __importDefault(require("../config/prisma"));
const config_1 = require("../config");
const apiResponse_1 = require("../utils/apiResponse");
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
const googleClient = new google_auth_library_1.OAuth2Client(config_1.config.google.clientId);
const COOKIE_OPTS = {
    httpOnly: true,
    secure: config_1.config.isProd,
    sameSite: 'strict',
};
// ─── REGISTER ────────────────────────────────────────────────
const register = async (req, res, next) => {
    const { name, email, password } = req.body;
    const existing = await prisma_1.default.user.findUnique({ where: { email } });
    if (existing)
        throw new apiResponse_1.AppError('Email already registered', 409);
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    const emailVerifyToken = crypto_1.default.randomBytes(32).toString('hex');
    const smtpConfigured = config_1.config.smtp.user && config_1.config.smtp.user !== 'your_email@gmail.com';
    const user = await prisma_1.default.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            emailVerifyToken: smtpConfigured ? emailVerifyToken : null,
            isEmailVerified: !smtpConfigured,
        },
        select: { id: true, name: true, email: true, role: true, avatar: true },
    });
    // Send welcome/verification email (non-blocking)
    if (smtpConfigured) {
        (0, email_1.sendVerificationEmail)(email, name, emailVerifyToken).catch(() => { });
        apiResponse_1.ApiResponse.created(res, { user }, 'Account created! Please check your email to verify your account.');
    }
    else {
        // Dev mode: auto-verified — return token so frontend can auto-login
        const payload = { userId: user.id, email: user.email, role: user.role };
        const { accessToken, refreshToken } = (0, jwt_1.generateTokenPair)(payload);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { refreshToken: await bcryptjs_1.default.hash(refreshToken, 10) },
        });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: config_1.config.isProd, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
        apiResponse_1.ApiResponse.created(res, { user, accessToken }, 'Account created successfully! Welcome to HiveNest 🎉');
    }
};
exports.register = register;
// ─── VERIFY EMAIL ────────────────────────────────────────────
const verifyEmail = async (req, res) => {
    const { token } = req.query;
    if (!token)
        throw new apiResponse_1.AppError('Token required', 400);
    const user = await prisma_1.default.user.findFirst({
        where: { emailVerifyToken: token },
    });
    if (!user)
        throw new apiResponse_1.AppError('Invalid or expired token', 400);
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true, emailVerifyToken: null },
    });
    apiResponse_1.ApiResponse.success(res, null, 'Email verified successfully');
};
exports.verifyEmail = verifyEmail;
// ─── LOGIN ───────────────────────────────────────────────────
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user || !user.password)
        throw new apiResponse_1.AppError('Invalid credentials', 401);
    if (!user.isActive)
        throw new apiResponse_1.AppError('Account deactivated', 401);
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        throw new apiResponse_1.AppError('Invalid credentials', 401);
    // Only block login if SMTP is configured and email not verified
    const smtpConfigured = config_1.config.smtp.user && config_1.config.smtp.user !== 'your_email@gmail.com';
    if (smtpConfigured && !user.isEmailVerified) {
        throw new apiResponse_1.AppError('Please verify your email before logging in. Check your inbox.', 403);
    }
    const payload = { userId: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken } = (0, jwt_1.generateTokenPair)(payload);
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: { refreshToken: await bcryptjs_1.default.hash(refreshToken, 10), lastLogin: new Date() },
    });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    apiResponse_1.ApiResponse.success(res, {
        accessToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
};
exports.login = login;
// ─── GOOGLE LOGIN ────────────────────────────────────────────
const googleLogin = async (req, res) => {
    const { credential } = req.body;
    if (!credential)
        throw new apiResponse_1.AppError('Google credential required', 400);
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: config_1.config.google.clientId,
    });
    const payload = ticket.getPayload();
    if (!payload)
        throw new apiResponse_1.AppError('Invalid Google token', 400);
    const { sub: googleId, email, name, picture } = payload;
    if (!email || !name)
        throw new apiResponse_1.AppError('Google account missing info', 400);
    let user = await prisma_1.default.user.findFirst({
        where: { OR: [{ googleId }, { email }] },
    });
    if (!user) {
        user = await prisma_1.default.user.create({
            data: {
                googleId,
                email,
                name,
                avatar: picture,
                isEmailVerified: true,
                role: 'USER',
            },
        });
    }
    else if (!user.googleId) {
        user = await prisma_1.default.user.update({
            where: { id: user.id },
            data: { googleId, avatar: picture || user.avatar },
        });
    }
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken } = (0, jwt_1.generateTokenPair)(tokenPayload);
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: { refreshToken: await bcryptjs_1.default.hash(refreshToken, 10), lastLogin: new Date() },
    });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    apiResponse_1.ApiResponse.success(res, {
        accessToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
};
exports.googleLogin = googleLogin;
// ─── REFRESH TOKEN ───────────────────────────────────────────
const refreshToken = async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token)
        throw new apiResponse_1.AppError('Refresh token missing', 401);
    const decoded = (0, jwt_1.verifyRefreshToken)(token);
    const user = await prisma_1.default.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.refreshToken)
        throw new apiResponse_1.AppError('Invalid refresh token', 401);
    const isValid = await bcryptjs_1.default.compare(token, user.refreshToken);
    if (!isValid)
        throw new apiResponse_1.AppError('Invalid refresh token', 401);
    const payload = { userId: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken: newRefreshToken } = (0, jwt_1.generateTokenPair)(payload);
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: { refreshToken: await bcryptjs_1.default.hash(newRefreshToken, 10) },
    });
    res.cookie('refreshToken', newRefreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    apiResponse_1.ApiResponse.success(res, { accessToken });
};
exports.refreshToken = refreshToken;
// ─── LOGOUT ──────────────────────────────────────────────────
const logout = async (req, res) => {
    if (req.user) {
        await prisma_1.default.user.update({
            where: { id: req.user.userId },
            data: { refreshToken: null },
        });
    }
    res.clearCookie('refreshToken');
    apiResponse_1.ApiResponse.success(res, null, 'Logged out successfully');
};
exports.logout = logout;
// ─── FORGOT PASSWORD ─────────────────────────────────────────
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) {
        return apiResponse_1.ApiResponse.success(res, null, 'If that email exists, a reset link has been sent');
    }
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    const resetExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: resetToken, resetPasswordExp: resetExp },
    });
    // Non-blocking email send
    (0, email_1.sendPasswordResetEmail)(email, user.name, resetToken).catch(() => { });
    apiResponse_1.ApiResponse.success(res, null, 'If that email exists, a reset link has been sent');
};
exports.forgotPassword = forgotPassword;
// ─── RESET PASSWORD ──────────────────────────────────────────
const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    const user = await prisma_1.default.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExp: { gt: new Date() },
        },
    });
    if (!user)
        throw new apiResponse_1.AppError('Invalid or expired reset token', 400);
    const hashed = await bcryptjs_1.default.hash(password, 12);
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: { password: hashed, resetPasswordToken: null, resetPasswordExp: null, refreshToken: null, isEmailVerified: true },
    });
    res.clearCookie('refreshToken');
    apiResponse_1.ApiResponse.success(res, null, 'Password reset successfully. Please login.');
};
exports.resetPassword = resetPassword;
// ─── GET ME ──────────────────────────────────────────────────
const getMe = async (req, res) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: req.user.userId },
        select: {
            id: true, name: true, email: true, avatar: true,
            phone: true, role: true, isEmailVerified: true, createdAt: true,
            addresses: true,
        },
    });
    if (!user)
        throw new apiResponse_1.AppError('User not found', 404);
    apiResponse_1.ApiResponse.success(res, user);
};
exports.getMe = getMe;
// ─── UPDATE PROFILE ──────────────────────────────────────────
const updateProfile = async (req, res) => {
    const { name, phone } = req.body;
    const user = await prisma_1.default.user.update({
        where: { id: req.user.userId },
        data: { name, phone },
        select: { id: true, name: true, email: true, phone: true, avatar: true },
    });
    apiResponse_1.ApiResponse.success(res, user, 'Profile updated');
};
exports.updateProfile = updateProfile;
// ─── ADD ADDRESS ─────────────────────────────────────────────
const addAddress = async (req, res) => {
    const { name, phone, street, city, state, zip, country } = req.body;
    if (!name || !phone || !street || !city || !state || !zip) {
        throw new apiResponse_1.AppError('All address fields are required', 400);
    }
    const address = await prisma_1.default.address.create({
        data: {
            userId: req.user.userId,
            name,
            phone,
            street,
            city,
            state,
            zip,
            country: country || 'Pakistan',
        },
    });
    apiResponse_1.ApiResponse.created(res, address, 'Address added');
};
exports.addAddress = addAddress;
//# sourceMappingURL=auth.controller.js.map