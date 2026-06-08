import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from './logger';

// Create transporter — uses real SMTP if configured, else Ethereal (free test email)
let _transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (_transporter) return _transporter;

  const smtpConfigured = config.smtp.user && config.smtp.user !== 'your_email@gmail.com';

  if (smtpConfigured) {
    _transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
    logger.info('📧 Using real SMTP for emails');
  } else {
    // Auto-create free Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    logger.info(`📧 Using Ethereal test email: ${testAccount.user}`);
    logger.info('📧 Preview emails at: https://ethereal.email');
  }

  return _transporter;
}

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ff6b9d 0%, #ff4785 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; letter-spacing: 1px; }
    .header p { color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 13px; }
    .body { padding: 40px 30px; color: #333; line-height: 1.7; }
    .btn { display: inline-block; background: #ff4785; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
    .divider { height: 1px; background: #eee; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🐝 HiveNest</h1>
      <p>Premium E-Commerce Store</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} HiveNest. All rights reserved.</p>
      <p>This email was sent to you because you have an account with HiveNest.</p>
    </div>
  </div>
</body>
</html>`;

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
    });
    logger.info(`✅ Email sent to ${to}: ${subject}`);
    // Show Ethereal preview URL in console for dev testing
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`📧 Preview email at: ${previewUrl}`);
      console.log(`\n📧 ===== EMAIL PREVIEW =====`);
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Preview URL: ${previewUrl}`);
      console.log(`===========================\n`);
    }
  } catch (err) {
    logger.error(`Email failed to ${to}:`, err);
    // Don't throw — email failures should not crash the request
  }
};

export const sendVerificationEmail = async (to: string, name: string, token: string) => {
  const url = `${config.frontendUrl}/verify-email?token=${token}`;
  await sendEmail(
    to,
    '🎉 Welcome to HiveNest — Verify Your Email',
    baseTemplate(`
      <h2 style="color:#ff4785;margin-bottom:8px;">Welcome to HiveNest, ${name}! 🎉</h2>
      <p style="font-size:16px;color:#555;">We're so excited to have you with us! HiveNest is your premium destination for fashion, jewelry, perfume, and lifestyle products.</p>
      <div class="divider"></div>
      <p><strong>One last step</strong> — please verify your email address to unlock your account:</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${url}" class="btn">✅ Verify My Email</a>
      </div>
      <div style="background:#fff8f9;border-left:4px solid #ff4785;padding:14px 18px;border-radius:0 8px 8px 0;margin:20px 0;">
        <p style="margin:0;font-size:13px;color:#666;">🛍️ Once verified, you can start shopping, save items to your wishlist, and track your orders.</p>
      </div>
      <p style="font-size:13px;color:#999;margin-top:24px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    `)
  );
};

export const sendPasswordResetEmail = async (to: string, name: string, token: string) => {
  const url = `${config.frontendUrl}/reset-password?token=${token}`;
  await sendEmail(
    to,
    '🔐 Reset Your Password — HiveNest',
    baseTemplate(`
      <h2 style="color:#ff4785;">Password Reset Request 🔐</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>We received a request to reset your HiveNest account password. No worries — it happens to the best of us!</p>
      <div class="divider"></div>
      <p>Click the button below to create a new password:</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${url}" class="btn">🔑 Reset My Password</a>
      </div>
      <div style="background:#fff8f9;border-left:4px solid #ff4785;padding:14px 18px;border-radius:0 8px 8px 0;margin:20px 0;">
        <p style="margin:0;font-size:13px;color:#666;">⏰ This link expires in <strong>1 hour</strong> for your security.</p>
      </div>
      <p style="font-size:13px;color:#999;margin-top:20px;">If you didn't request a password reset, please ignore this email. Your account is safe and no changes were made.</p>
    `)
  );
};

export const sendOrderConfirmationEmail = async (
  to: string,
  name: string,
  orderNumber: string,
  total: number,
  items: Array<{ name: string; quantity: number; price: number }>
) => {
  const itemRows = items
    .map(i => `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${i.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${(i.price * i.quantity).toFixed(2)}</td></tr>`)
    .join('');

  await sendEmail(
    to,
    `Order Confirmed #${orderNumber} - HiveNest`,
    baseTemplate(`
      <h2>Order Confirmed! ✅</h2>
      <p>Hi ${name}, your order has been placed successfully.</p>
      <div class="divider"></div>
      <p><strong>Order #${orderNumber}</strong></p>
      <table style="width:100%;border-collapse:collapse;margin:15px 0;">
        <thead><tr style="background:#f9f9f9;"><th style="padding:10px;text-align:left;">Product</th><th style="padding:10px;text-align:center;">Qty</th><th style="padding:10px;text-align:right;">Price</th></tr></thead>
        <tbody>${itemRows}</tbody>
        <tfoot><tr><td colspan="2" style="padding:10px;text-align:right;font-weight:600;">Total:</td><td style="padding:10px;text-align:right;font-weight:700;color:#ff4785;">$${total.toFixed(2)}</td></tr></tfoot>
      </table>
      <div class="divider"></div>
      <a href="${config.frontendUrl}/orders" class="btn">View Your Order</a>
    `)
  );
};
