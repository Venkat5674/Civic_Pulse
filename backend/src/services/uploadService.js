const cloudinary = require('../config/cloudinary');
const env = require('../config/env');
const logger = require('../config/logger');

/**
 * Helper to upload image stream/buffer to Cloudinary
 */
async function uploadImageToCloudinary(fileBuffer, folder = 'civicpulse_uploads', mimeType = 'image/jpeg') {
  return new Promise((resolve) => {
    const apiKey = env.CLOUDINARY?.API_KEY || process.env.CLOUDINARY_API_KEY;
    // If Cloudinary keys are not fully set in dev mode, fallback to placeholder
    if (!apiKey || apiKey === '123456789' || apiKey.trim() === '') {
      logger.warn('Cloudinary API key not configured, returning placeholder image');
      return resolve({
        imageUrl: `https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80`,
        publicId: `dev_upload_${Date.now()}`,
      });
    }

    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) {
            logger.warn(`Cloudinary upload warning (${error.message || error}). Falling back to local data URI.`);
            const b64 = fileBuffer ? fileBuffer.toString('base64') : '';
            return resolve({
              imageUrl: `data:${mimeType};base64,${b64}`,
              publicId: `fallback_${Date.now()}`,
            });
          }
          resolve({
            imageUrl: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      uploadStream.end(fileBuffer);
    } catch (err) {
      logger.warn(`Cloudinary exception (${err.message}). Falling back to local data URI.`);
      const b64 = fileBuffer ? fileBuffer.toString('base64') : '';
      resolve({
        imageUrl: `data:${mimeType};base64,${b64}`,
        publicId: `fallback_${Date.now()}`,
      });
    }
  });
}

module.exports = {
  uploadImageToCloudinary,
};
