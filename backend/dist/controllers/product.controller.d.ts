import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getProducts: (req: Request, res: Response) => Promise<void>;
export declare const getProduct: (req: Request, res: Response) => Promise<void>;
export declare const searchProducts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const uploadProductImages: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getHomeData: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=product.controller.d.ts.map