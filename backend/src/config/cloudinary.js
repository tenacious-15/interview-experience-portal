import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

const hasCloudinaryConfig = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary storage configuration initialized.');
} else {
  console.log('No Cloudinary config found. Running in Local Base64 storage mode.');
}

/**
 * Uploads an image to Cloudinary, or falls back to returning the base64 data string
 * @param {string} imageStr - Base64 image representation or URL
 * @returns {Promise<string>} - The remote URL or base64 fallback string
 */
export const uploadImage = async (imageStr) => {
  if (!imageStr) return '';
  
  // If it's already a URL (e.g. from seed data), return it directly
  if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) {
    return imageStr;
  }

  if (hasCloudinaryConfig) {
    try {
      const uploadResponse = await cloudinary.uploader.upload(imageStr, {
        folder: 'interview_experiences',
        resource_type: 'image'
      });
      return uploadResponse.secure_url;
    } catch (error) {
      console.error('Cloudinary upload failed, falling back to local string:', error.message);
      return imageStr;
    }
  } else {
    // Zero-config fallback: return the input base64 string directly to be stored in the DB
    return imageStr;
  }
};
