import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { ApiResponse, AppError } from '../utils/apiResponse';
import { sendEmail } from '../utils/email';
import { logger } from '../utils/logger';
import { config } from '../config';

// ─── Welcome email template ───────────────────────────────────
const welcomeEmailHtml = (email: string, unsubToken: string) => {
  const unsubUrl = `${config.frontendUrl}/unsubscribe?token=${unsubToken}`;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ff6b9d 0%, #ff4785 100%); padding: 36px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 30px; letter-spacing: 1px; }
    .header p { color: rgba(255,255,255,0.9); margin: 6px 0 0; font-size: 14px; }
    .body { padding: 40px 32px; color: #333; line-height: 1.8; font-size: 15px; }
    .highlight { background: #fff5f8; border-left: 4px solid #ff4785; padding: 14px 18px; border-radius: 6px; margin: 20px 0; }
    .btn { display: inline-block; background: #ff4785; color: white !important; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; margin: 24px 0; }
    .perks { display: flex; flex-direction: column; gap: 10px; margin: 20px 0; }
    .perk { display: flex; align-items: flex-start; gap: 10px; }
    .perk-icon { font-size: 20px; flex-shrink: 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; }
    .footer a { color: #ccc; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🐝 HiveNest</h1>
      <p>Premium Fashion &amp; Lifestyle Store</p>
    </div>
    <div class="body">
      <h2 style="color:#ff4785;margin-bottom:6px;">You're officially in! 🎉</h2>
      <p>Welcome to the HiveNest family. You've just subscribed to our newsletter with <strong>${email}</strong>.</p>

      <div class="highlight">
        <strong>What to expect from us:</strong>
      </div>

      <div class="perks">
        <div class="perk"><span class="perk-icon">🛍️</span><span><strong>Exclusive Deals</strong> — Flash sales and subscriber-only discounts delivered straight to your inbox.</span></div>
        <div class="perk"><span class="perk-icon">✨</span><span><strong>New Arrivals First</strong> — Be the first to know when new fashion, jewelry &amp; lifestyle products drop.</span></div>
        <div class="perk"><span class="perk-icon">💡</span><span><strong>Style Tips</strong> — Curated fashion &amp; lifestyle content to keep your look fresh.</span></div>
        <div class="perk"><span class="perk-icon">🎁</span><span><strong>Special Offers</strong> — Birthday surprises and seasonal gift guides just for subscribers.</span></div>
      </div>

      <div style="text-align:center;">
        <a href="${config.frontendUrl}/products" class="btn">Shop Now</a>
      </div>

      <p style="font-size:13px;color:#999;margin-top:30px;border-top:1px solid #eee;padding-top:16px;">
        Don't want to hear from us? No hard feelings —
        <a href="${unsubUrl}" style="color:#ff4785;">unsubscribe here</a>.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} HiveNest. All rights reserved.</p>
      <p>📍 123 Fashion Street, Karachi, Pakistan</p>
    </div>
  </div>
</body>
</html>`;
};

// ─── POST /api/v1/newsletter/subscribe ───────────────────────
export const subscribe = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if already subscribed
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    if (existing.isActive) {
      return ApiResponse.success(res, null, 'You are already subscribed to our newsletter!');
    }
    // Re-subscribe if they had unsubscribed
    await prisma.newsletterSubscriber.update({
      where: { email: normalizedEmail },
      data: { isActive: true },
    });
    return ApiResponse.success(res, null, 'Welcome back! You have been re-subscribed.');
  }

  // Create new subscriber
  const subscriber = await prisma.newsletterSubscriber.create({
    data: { email: normalizedEmail },
  });

  // Send welcome email (non-blocking — don't fail the subscription if email fails)
  sendEmail(
    normalizedEmail,
    '🎉 Welcome to HiveNest Newsletter!',
    welcomeEmailHtml(normalizedEmail, subscriber.unsubToken)
  ).catch((err) => logger.error(`Newsletter welcome email failed for ${normalizedEmail}: ${err?.message}`));

  return ApiResponse.created(res, null, 'Subscribed successfully! Check your email for a welcome message.');
};

// ─── GET /api/v1/newsletter/unsubscribe?token=xxx ────────────
export const unsubscribe = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    throw new AppError('Invalid unsubscribe token', 400);
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { unsubToken: token },
  });

  if (!subscriber) {
    throw new AppError('Invalid or expired unsubscribe link', 404);
  }

  if (!subscriber.isActive) {
    return ApiResponse.success(res, null, 'You are already unsubscribed.');
  }

  await prisma.newsletterSubscriber.update({
    where: { unsubToken: token },
    data: { isActive: false },
  });

  return ApiResponse.success(res, null, 'You have been unsubscribed successfully.');
};

// ─── GET /api/v1/admin/newsletter ────────────────────────────
export const adminGetSubscribers = async (req: Request, res: Response) => {
  const { page = '1', limit = '50', active } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const where: any = {};
  if (active !== undefined) where.isActive = active === 'true';

  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { subscribedAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      select: { id: true, email: true, isActive: true, subscribedAt: true },
    }),
    prisma.newsletterSubscriber.count({ where }),
  ]);

  return ApiResponse.paginated(res, subscribers, total, pageNum, limitNum);
};
