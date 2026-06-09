import { v2 as cloudinary } from 'cloudinary';
export declare const uploadImage: (filePath: string, folder?: string) => Promise<{
    url: string;
    publicId: string;
}>;
export declare const deleteImage: (publicId: string) => Promise<void>;
export declare const uploadMultiple: (files: string[], folder?: string) => Promise<{
    url: string;
    publicId: string;
}[]>;
export default cloudinary;
//# sourceMappingURL=cloudinary.d.ts.map