"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOrderConfirmationEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
const logger_1 = require("./logger");
// Create transporter — uses real SMTP if configured, else Ethereal (free test email)
let _transporter = null;
async function getTransporter() {
    if (_transporter)
        return _transporter;
    const smtpConfigured = config_1.config.smtp.user && config_1.config.smtp.user !== 'your_email@gmail.com';
    if (smtpConfigured) {
        _transporter = nodemailer_1.default.createTransport({
            host: config_1.config.smtp.host,
            port: config_1.config.smtp.port,
            secure: config_1.config.smtp.port === 465,
            auth: { user: config_1.config.smtp.user, pass: config_1.config.smtp.pass },
        });
        logger_1.logger.info('📧 Using real SMTP for emails');
    }
    else {
        // Auto-create free Ethereal test account
        const testAccount = await nodemailer_1.default.createTestAccount();
        _transporter = nodemailer_1.default.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        logger_1.logger.info(`📧 Using Ethereal test email: ${testAccount.user}`);
        logger_1.logger.info('📧 Preview emails at: https://ethereal.email');
    }
    return _transporter;
}
const baseTemplate = (content) => `
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
const sendEmail = async (to, subject, html) => {
    try {
        const transport = await getTransporter();
        const info = await transport.sendMail({
            from: config_1.config.smtp.from,
            to,
            subject,
            html,
        });
        logger_1.logger.info(`✅ Email sent to ${to}: ${subject}`);
        // Show Ethereal preview URL in console for dev testing
        const previewUrl = nodemailer_1.default.getTestMessageUrl(info);
        if (previewUrl) {
            logger_1.logger.info(`📧 Preview email at: ${previewUrl}`);
            console.log(`\n📧 ===== EMAIL PREVIEW =====`);
            console.log(`   To: ${to}`);
            console.log(`   Subject: ${subject}`);
            console.log(`   Preview URL: ${previewUrl}`);
            console.log(`===========================\n`);
        }
    }
    catch (err) {
        logger_1.logger.error(`Email failed to ${to}:`, err);
        // Don't throw — email failures should not crash the request
    }
};
exports.sendEmail = sendEmail;
const sendVerificationEmail = async (to, name, token) => {
    const url = `${config_1.config.frontendUrl}/verify-email?token=${token}`;
    await (0, exports.sendEmail)(to, '🎉 Welcome to HiveNest — Verify Your Email', baseTemplate(`
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
    `));
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (to, name, token) => {
    const url = `${config_1.config.frontendUrl}/reset-password?token=${token}`;
    await (0, exports.sendEmail)(to, '🔐 Reset Your Password — HiveNest', baseTemplate(`
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
    `));
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendOrderConfirmationEmail = async (to, name, orderNumber, total, items) => {
    const itemRows = items
        .map(i => `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${i.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${(i.price * i.quantity).toFixed(2)}</td></tr>`)
        .join('');
    await (0, exports.sendEmail)(to, `Order Confirmed #${orderNumber} - HiveNest`, baseTemplate(`
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
      <a href="${config_1.config.frontendUrl}/orders" class="btn">View Your Order</a>
    `));
};
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
//# sourceMappingURL=email.js.map