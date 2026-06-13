import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/errorHandler';
import * as auth from '../controllers/auth.controller';
import * as product from '../controllers/product.controller';
import * as shop from '../controllers/shop.controller';
import * as admin from '../controllers/admin.controller';
import * as blog from '../controllers/blog.controller';
import * as newsletter from '../controllers/newsletter.controller';
import {
  registerSchema, loginSchema, forgotPasswordSchema,
  resetPasswordSchema, cartItemSchema, orderSchema,
  reviewSchema, couponSchema, categorySchema, blogSchema,
  newsletterSubscribeSchema,
} from '../validators/schemas';

const router = Router();

const tempUpload = multer({ dest: path.join(process.cwd(), 'tmp', 'uploads') });

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const localUpload = multer({
  storage: localStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many attempts' });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: 'Too many registration attempts, please try again later.' });
const forgotPasswordLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: 'Too many password reset attempts' });
const searchLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

const authRouter = Router();
authRouter.post('/register', registerLimiter, validate(registerSchema), auth.register);
authRouter.post('/login', authLimiter, validate(loginSchema), auth.login);
authRouter.post('/google', authLimiter, auth.googleLogin);
authRouter.post('/refresh', auth.refreshToken);
authRouter.post('/logout', protect, auth.logout);
authRouter.get('/verify-email', auth.verifyEmail);
authRouter.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), auth.forgotPassword);
authRouter.post('/reset-password', authLimiter, validate(resetPasswordSchema), auth.resetPassword);
authRouter.get('/me', protect, auth.getMe);
authRouter.patch('/me', protect, auth.updateProfile);
authRouter.post('/me/address', protect, auth.addAddress);

const productRouter = Router();
productRouter.get('/', product.getProducts);
productRouter.get('/home', product.getHomeData);
productRouter.get('/search', searchLimiter, product.searchProducts);
productRouter.get('/:slug', product.getProduct);
productRouter.post('/', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), product.createProduct);
productRouter.patch('/:id', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), product.updateProduct);
productRouter.delete('/:id', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), product.deleteProduct);
productRouter.post('/:id/images', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), tempUpload.array('images', 6), product.uploadProductImages);

router.post(
  '/upload/image',
  protect,
  restrictTo('ADMIN', 'SUPER_ADMIN'),
  localUpload.single('image'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    return res.json({ success: true, data: { url } });
  }
);

const cartRouter = Router();
cartRouter.use(protect);
cartRouter.get('/', shop.getCart);
cartRouter.post('/', validate(cartItemSchema), shop.addToCart);
cartRouter.patch('/:id', shop.updateCartItem);
cartRouter.delete('/:id', shop.removeFromCart);
cartRouter.delete('/', shop.clearCart);

const wishlistRouter = Router();
wishlistRouter.use(protect);
wishlistRouter.get('/', shop.getWishlist);
wishlistRouter.post('/toggle', shop.toggleWishlist);

const orderRouter = Router();
orderRouter.use(protect);
orderRouter.get('/', shop.getOrders);
orderRouter.post('/', validate(orderSchema), shop.createOrder);
orderRouter.get('/:id', shop.getOrder);
orderRouter.post('/:id/cancel', shop.cancelOrder);

const reviewRouter = Router();
reviewRouter.get('/:productId', shop.getProductReviews);
reviewRouter.post('/', protect, validate(reviewSchema), shop.addReview);

const couponRouter = Router();
couponRouter.post('/validate', protect, shop.validateCoupon);

const blogRouter = Router();
blogRouter.get('/', blog.getBlogs);
blogRouter.get('/categories', blog.getBlogCategories);
blogRouter.get('/:slug', blog.getBlog);

const adminRouter = Router();
adminRouter.use(protect, restrictTo('ADMIN', 'SUPER_ADMIN'));
adminRouter.get('/dashboard', admin.getDashboard);
adminRouter.get('/orders', admin.adminGetOrders);
adminRouter.patch('/orders/:id', admin.adminUpdateOrder);
adminRouter.get('/users', admin.adminGetUsers);
adminRouter.patch('/users/:id', admin.adminUpdateUser);
adminRouter.get('/categories', admin.adminGetCategories);
adminRouter.post('/categories', validate(categorySchema), admin.adminCreateCategory);
adminRouter.patch('/categories/:id', admin.adminUpdateCategory);
adminRouter.delete('/categories/:id', admin.adminDeleteCategory);
adminRouter.get('/coupons', admin.adminGetCoupons);
adminRouter.post('/coupons', validate(couponSchema), admin.adminCreateCoupon);
adminRouter.patch('/coupons/:id', admin.adminUpdateCoupon);
adminRouter.delete('/coupons/:id', admin.adminDeleteCoupon);
adminRouter.get('/blogs', admin.adminGetBlogs);
adminRouter.post('/blogs', validate(blogSchema), admin.adminCreateBlog);
adminRouter.patch('/blogs/:id', admin.adminUpdateBlog);
adminRouter.delete('/blogs/:id', admin.adminDeleteBlog);
adminRouter.get('/inventory', admin.adminGetInventory);
adminRouter.patch('/inventory/:productId', admin.adminUpdateInventory);
adminRouter.get('/newsletter', newsletter.adminGetSubscribers);

// ─── Newsletter (public) ──────────────────────────────────────
const newsletterRouter = Router();
const newsletterLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: 'Too many subscribe attempts, please try again later.' });
newsletterRouter.post('/subscribe', newsletterLimiter, validate(newsletterSubscribeSchema), newsletter.subscribe);
newsletterRouter.get('/unsubscribe', newsletter.unsubscribe);

router.use('/auth', authRouter);
router.use('/products', productRouter);
router.use('/cart', cartRouter);
router.use('/wishlist', wishlistRouter);
router.use('/orders', orderRouter);
router.use('/reviews', reviewRouter);
router.use('/coupons', couponRouter);
router.use('/blogs', blogRouter);
router.use('/admin', adminRouter);
router.use('/newsletter', newsletterRouter);

export default router;
