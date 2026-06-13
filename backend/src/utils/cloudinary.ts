import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadImage = async (filePath: string, folder = 'hivenest/products'): Promise<{ url: string; publicId: string }> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  return { url: result.secure_url, publicId: result.public_id };
};

export const deleteImage = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export const uploadMultiple = async (files: string[], folder = 'hivenest/products') => {
  return Promise.all(files.map(f => uploadImage(f, folder)));
};

export default cloudinary;
