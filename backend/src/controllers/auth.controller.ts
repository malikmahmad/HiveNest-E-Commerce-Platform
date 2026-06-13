import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/prisma';
import { config } from '../config';
import { ApiResponse, AppError } from '../utils/apiResponse';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const googleClient = new OAuth2Client(config.google.clientId);

const COOKIE_OPTS = {
  httpOnly: true,
  secure: config.isProd,
  sameSite: 'strict' as const,
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already registered', 409);

  const hashedPassword = await bcrypt.hash(password, 12);
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');
  const smtpConfigured = config.smtp.user && config.smtp.user !== 'your_email@gmail.com';

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      emailVerifyToken: smtpConfigured ? emailVerifyToken : null,
      isEmailVerified: !smtpConfigured,
    },
    select: { id: true, name: true, email: true, role: true, avatar: true },
  });

  if (smtpConfigured) {
    sendVerificationEmail(email, name, emailVerifyToken).catch((err) => {
      logger.error(`Verification email failed for ${email}: ${err?.message}`);
    });
    ApiResponse.created(res, { user }, 'Account created! Please check your email to verify your account.');
  } else {
    const payload = { userId: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken } = generateTokenPair(payload);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(refreshToken, 10) },
    });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: config.isProd, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    ApiResponse.created(res, { user, accessToken }, 'Account created successfully! Welcome to HiveNest');
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token) throw new AppError('Token required', 400);

  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token as string } });
  if (!user) throw new AppError('Invalid or expired token', 400);

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailVerifyToken: null },
  });

  ApiResponse.success(res, null, 'Email verified successfully');
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) throw new AppError('Invalid credentials', 401);
  if (!user.isActive) throw new AppError('Account deactivated', 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid credentials', 401);

  const smtpConfigured = config.smtp.user && config.smtp.user !== 'your_email@gmail.com';
  if (smtpConfigured && !user.isEmailVerified) {
    throw new AppError('Please verify your email before logging in. Check your inbox.', 403);
  }

  const payload = { userId: user.id, email: user.email, role: user.role };
  const { accessToken, refreshToken } = generateTokenPair(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: await bcrypt.hash(refreshToken, 10), lastLogin: new Date() },
  });

  res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

  ApiResponse.success(res, {
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
};

export const googleLogin = async (req: Request, res: Response) => {
  const { credential } = req.body;
  if (!credential) throw new AppError('Google credential required', 400);

  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: config.google.clientId });
  const payload = ticket.getPayload();
  if (!payload) throw new AppError('Invalid Google token', 400);

  const { sub: googleId, email, name, picture } = payload;
  if (!email || !name) throw new AppError('Google account missing info', 400);

  let user = await prisma.user.findFirst({ where: { OR: [{ googleId }, { email }] } });

  if (!user) {
    user = await prisma.user.create({
      data: { googleId, email, name, avatar: picture, isEmailVerified: true, role: 'USER' },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId, avatar: picture || user.avatar },
    });
  }

  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: await bcrypt.hash(refreshToken, 10), lastLogin: new Date() },
  });

  res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

  ApiResponse.success(res, {
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError('Refresh token missing', 401);

  const decoded = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

  if (!user || !user.refreshToken) throw new AppError('Invalid refresh token', 401);

  const isValid = await bcrypt.compare(token, user.refreshToken);
  if (!isValid) throw new AppError('Invalid refresh token', 401);

  const payload = { userId: user.id, email: user.email, role: user.role };
  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: await bcrypt.hash(newRefreshToken, 10) },
  });

  res.cookie('refreshToken', newRefreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
  ApiResponse.success(res, { accessToken });
};

export const logout = async (req: AuthRequest, res: Response) => {
  if (req.user) {
    await prisma.user.update({ where: { id: req.user.userId }, data: { refreshToken: null } });
  }
  res.clearCookie('refreshToken');
  ApiResponse.success(res, null, 'Logged out successfully');
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return ApiResponse.success(res, null, 'If that email exists, a reset link has been sent');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExp = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetPasswordToken: resetToken, resetPasswordExp: resetExp },
  });

  sendPasswordResetEmail(email, user.name, resetToken).catch((err) => {
    logger.error(`Forgot password email failed for ${email}: ${err?.message}`);
  });
  ApiResponse.success(res, null, 'If that email exists, a reset link has been sent');
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  const user = await prisma.user.findFirst({
    where: { resetPasswordToken: token, resetPasswordExp: { gt: new Date() } },
  });

  if (!user) throw new AppError('Invalid or expired reset token', 400);

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetPasswordToken: null, resetPasswordExp: null, refreshToken: null, isEmailVerified: true },
  });

  res.clearCookie('refreshToken');
  ApiResponse.success(res, null, 'Password reset successfully. Please login.');
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true, name: true, email: true, avatar: true,
      phone: true, role: true, isEmailVerified: true, createdAt: true,
      addresses: true,
    },
  });
  if (!user) throw new AppError('User not found', 404);
  ApiResponse.success(res, user);
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { name, phone } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { name, phone },
    select: { id: true, name: true, email: true, phone: true, avatar: true },
  });
  ApiResponse.success(res, user, 'Profile updated');
};

export const addAddress = async (req: AuthRequest, res: Response) => {
  const { name, phone, street, city, state, zip, country } = req.body;
  if (!name || !phone || !street || !city || !state || !zip) {
    throw new AppError('All address fields are required', 400);
  }
  const address = await prisma.address.create({
    data: {
      userId: req.user!.userId,
      name, phone, street, city, state, zip,
      country: country || 'Pakistan',
    },
  });
  ApiResponse.created(res, address, 'Address added');
};
