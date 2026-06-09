import { Response } from 'express';
export declare class ApiResponse {
    static success<T>(res: Response, data: T, message?: string, statusCode?: number): Response<any, Record<string, any>>;
    static created<T>(res: Response, data: T, message?: string): Response<any, Record<string, any>>;
    static error(res: Response, message: string, statusCode?: number, errors?: unknown): Response<any, Record<string, any>>;
    static paginated<T>(res: Response, data: T[], total: number, page: number, limit: number, message?: string): Response<any, Record<string, any>>;
}
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number);
}
//# sourceMappingURL=apiResponse.d.ts.map