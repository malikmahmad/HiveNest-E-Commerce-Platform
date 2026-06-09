"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.deleteImage = exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const config_1 = require("../config");
cloudinary_1.v2.config({
    cloud_name: config_1.config.cloudinary.cloudName,
    api_key: config_1.config.cloudinary.apiKey,
    api_secret: config_1.config.cloudinary.apiSecret,
});
const uploadImage = async (filePath, folder = 'hivenest/products') => {
    const result = await cloudinary_1.v2.uploader.upload(filePath, {
        folder,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });
    return { url: result.secure_url, publicId: result.public_id };
};
exports.uploadImage = uploadImage;
const deleteImage = async (publicId) => {
    await cloudinary_1.v2.uploader.destroy(publicId);
};
exports.deleteImage = deleteImage;
const uploadMultiple = async (files, folder = 'hivenest/products') => {
    return Promise.all(files.map(f => (0, exports.uploadImage)(f, folder)));
};
exports.uploadMultiple = uploadMultiple;
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map