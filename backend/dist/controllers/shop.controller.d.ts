import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getCart: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addToCart: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateCartItem: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const removeFromCart: (req: AuthRequest, res: Response) => Promise<void>;
export declare const clearCart: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getWishlist: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleWishlist: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createOrder: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getOrders: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getOrder: (req: AuthRequest, res: Response) => Promise<void>;
export declare const cancelOrder: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addReview: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProductReviews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const validateCoupon: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=shop.controller.d.ts.map