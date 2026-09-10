import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file buffer directly to Cloudinary
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} originalName - Original filename
 * @param {string} folder - Destination folder in Cloudinary
 * @returns {Promise<string>} Secure URL of the uploaded asset
 */
export const uploadToCloudinary = (buffer, originalName, folder = 'codathon_ppts') => {
  return new Promise((resolve, reject) => {
    // Sanitize filename
    const cleanName = originalName
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const publicId = `${folder}/${cleanName}_${Date.now()}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        public_id: publicId,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Generate a signed private download URL for Cloudinary assets.
 * Solves Cloudinary 401 Unauthorized / ACL delivery restrictions on PDF/office files.
 * @param {string} urlOrPublicId - Cloudinary secure_url or public_id
 * @param {boolean} attachment - Whether to force file download or display inline
 * @returns {string} Authenticated download URL
 */
export const getCloudinaryDownloadUrl = (urlOrPublicId, attachment = false) => {
  if (!urlOrPublicId || typeof urlOrPublicId !== 'string') {
    return null;
  }

  // If it's not a Cloudinary URL, return as-is
  if (!urlOrPublicId.includes('cloudinary.com') && !urlOrPublicId.startsWith('codathon_ppts/')) {
    return urlOrPublicId;
  }

  try {
    let publicId = urlOrPublicId;
    let format = 'pdf';
    let resourceType = 'image';

    // Parse Cloudinary URL format: .../(image|raw)/upload/(v123456/)?(public_id).(ext)
    const match = urlOrPublicId.match(/\/(image|raw)\/upload\/(?:[^\/]+\/)?(?:v\d+\/)?(.+?)(?:\.([a-zA-Z0-9]+))?$/);
    if (match) {
      resourceType = match[1] || 'image';
      publicId = match[2];
      format = match[3] || 'pdf';
    } else if (urlOrPublicId.includes('.')) {
      const parts = urlOrPublicId.split('.');
      format = parts.pop();
      publicId = parts.join('.');
    }

    // Generate signed download URL using Cloudinary API credentials
    const signedUrl = cloudinary.utils.private_download_url(publicId, format, {
      resource_type: resourceType,
      type: 'upload',
      attachment: attachment,
    });

    return signedUrl || urlOrPublicId;
  } catch (err) {
    console.error('Error generating Cloudinary signed download URL:', err);
    return urlOrPublicId;
  }
};

export default cloudinary;
