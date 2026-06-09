"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const auth = __importStar(require("../controllers/auth.controller"));
const product = __importStar(require("../controllers/product.controller"));
const shop = __importStar(require("../controllers/shop.controller"));
const admin = __importStar(require("../controllers/admin.controller"));
const blog = __importStar(require("../controllers/blog.controller"));
const schemas_1 = require("../validators/schemas");
const router = (0, express_1.Router)();
// Multer for temp uploads (Cloudinary)
const tempUpload = (0, multer_1.default)({ dest: path_1.default.join(process.cwd(), 'tmp', 'uploads') });
// Multer for local uploads — saves to /uploads folder in project root
const uploadDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadDir))
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
const localStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
});
const localUpload = (0, multer_1.default)({
    storage: localStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/'))
            cb(null, true);
        else
            cb(new Error('Only image files allowed'));
    },
});
// Rate limiters
const authLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many attempts' });
const searchLimiter = (0, express_rate_limit_1.default)({ windowMs: 60 * 1000, max: 30 });
// ─── AUTH ─────────────────────────────────────────────────────
const authRouter = (0, express_1.Router)();
authRouter.post('/register', authLimiter, (0, errorHandler_1.validate)(schemas_1.registerSchema), auth.register);
authRouter.post('/login', authLimiter, (0, errorHandler_1.validate)(schemas_1.loginSchema), auth.login);
authRouter.post('/google', authLimiter, auth.googleLogin);
authRouter.post('/refresh', auth.refreshToken);
authRouter.post('/logout', auth_1.protect, auth.logout);
authRouter.get('/verify-email', auth.verifyEmail);
authRouter.post('/forgot-password', authLimiter, (0, errorHandler_1.validate)(schemas_1.forgotPasswordSchema), auth.forgotPassword);
authRouter.post('/reset-password', authLimiter, (0, errorHandler_1.validate)(schemas_1.resetPasswordSchema), auth.resetPassword);
authRouter.get('/me', auth_1.protect, auth.getMe);
authRouter.patch('/me', auth_1.protect, auth.updateProfile);
authRouter.post('/me/address', auth_1.protect, auth.addAddress);
// ─── PRODUCTS ────────────────────────────────────────────────
const productRouter = (0, express_1.Router)();
productRouter.get('/', product.getProducts);
productRouter.get('/home', product.getHomeData);
productRouter.get('/search', searchLimiter, product.searchProducts);
productRouter.get('/:slug', product.getProduct);
// Admin product routes
productRouter.post('/', auth_1.protect, (0, auth_1.restrictTo)('ADMIN', 'SUPER_ADMIN'), product.createProduct);
productRouter.patch('/:id', auth_1.protect, (0, auth_1.restrictTo)('ADMIN', 'SUPER_ADMIN'), product.updateProduct);
productRouter.delete('/:id', auth_1.protect, (0, auth_1.restrictTo)('ADMIN', 'SUPER_ADMIN'), product.deleteProduct);
productRouter.post('/:id/images', auth_1.protect, (0, auth_1.restrictTo)('ADMIN', 'SUPER_ADMIN'), tempUpload.array('images', 6), product.uploadProductImages);
// ─── LOCAL IMAGE UPLOAD ───────────────────────────────────────
// Upload image to local /uploads folder, returns URL
router.post('/upload/image', auth_1.protect, (0, auth_1.restrictTo)('ADMIN', 'SUPER_ADMIN'), localUpload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // Store as relative path — works in dev (proxied) and prod
    const url = `/uploads/${req.file.filename}`;
    return res.json({ success: true, data: { url } });
});
// ─── CART ─────────────────────────────────────────────────────
const cartRouter = (0, express_1.Router)();
cartRouter.use(auth_1.protect);
cartRouter.get('/', shop.getCart);
cartRouter.post('/', (0, errorHandler_1.validate)(schemas_1.cartItemSchema), shop.addToCart);
cartRouter.patch('/:id', shop.updateCartItem);
cartRouter.delete('/:id', shop.removeFromCart);
cartRouter.delete('/', shop.clearCart);
// ─── WISHLIST ────────────────────────────────────────────────
const wishlistRouter = (0, express_1.Router)();
wishlistRouter.use(auth_1.protect);
wishlistRouter.get('/', shop.getWishlist);
wishlistRouter.post('/toggle', shop.toggleWishlist);
// ─── ORDERS ──────────────────────────────────────────────────
const orderRouter = (0, express_1.Router)();
orderRouter.use(auth_1.protect);
orderRouter.get('/', shop.getOrders);
orderRouter.post('/', (0, errorHandler_1.validate)(schemas_1.orderSchema), shop.createOrder);
orderRouter.get('/:id', shop.getOrder);
orderRouter.post('/:id/cancel', shop.cancelOrder);
// ─── REVIEWS ─────────────────────────────────────────────────
const reviewRouter = (0, express_1.Router)();
reviewRouter.get('/:productId', shop.getProductReviews);
reviewRouter.post('/', auth_1.protect, (0, errorHandler_1.validate)(schemas_1.reviewSchema), shop.addReview);
// ─── COUPONS ─────────────────────────────────────────────────
const couponRouter = (0, express_1.Router)();
couponRouter.post('/validate', auth_1.protect, shop.validateCoupon);
// ─── BLOGS ───────────────────────────────────────────────────
const blogRouter = (0, express_1.Router)();
blogRouter.get('/', blog.getBlogs);
blogRouter.get('/categories', blog.getBlogCategories);
blogRouter.get('/:slug', blog.getBlog);
// ─── ADMIN ───────────────────────────────────────────────────
const adminRouter = (0, express_1.Router)();
adminRouter.use(auth_1.protect, (0, auth_1.restrictTo)('ADMIN', 'SUPER_ADMIN'));
adminRouter.get('/dashboard', admin.getDashboard);
adminRouter.get('/orders', admin.adminGetOrders);
adminRouter.patch('/orders/:id', admin.adminUpdateOrder);
adminRouter.get('/users', admin.adminGetUsers);
adminRouter.patch('/users/:id', admin.adminUpdateUser);
adminRouter.get('/categories', admin.adminGetCategories);
adminRouter.post('/categories', (0, errorHandler_1.validate)(schemas_1.categorySchema), admin.adminCreateCategory);
adminRouter.patch('/categories/:id', admin.adminUpdateCategory);
adminRouter.delete('/categories/:id', admin.adminDeleteCategory);
adminRouter.get('/coupons', admin.adminGetCoupons);
adminRouter.post('/coupons', (0, errorHandler_1.validate)(schemas_1.couponSchema), admin.adminCreateCoupon);
adminRouter.patch('/coupons/:id', admin.adminUpdateCoupon);
adminRouter.delete('/coupons/:id', admin.adminDeleteCoupon);
adminRouter.get('/blogs', admin.adminGetBlogs);
adminRouter.post('/blogs', (0, errorHandler_1.validate)(schemas_1.blogSchema), admin.adminCreateBlog);
adminRouter.patch('/blogs/:id', admin.adminUpdateBlog);
adminRouter.delete('/blogs/:id', admin.adminDeleteBlog);
adminRouter.get('/inventory', admin.adminGetInventory);
adminRouter.patch('/inventory/:productId', admin.adminUpdateInventory);
// Mount
router.use('/auth', authRouter);
router.use('/products', productRouter);
router.use('/cart', cartRouter);
router.use('/wishlist', wishlistRouter);
router.use('/orders', orderRouter);
router.use('/reviews', reviewRouter);
router.use('/coupons', couponRouter);
router.use('/blogs', blogRouter);
router.use('/admin', adminRouter);
exports.default = router;
//# sourceMappingURL=index.js.map