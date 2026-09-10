import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter to protect against spam / DoS
 */
export const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200, // 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests from this IP. Please try again after a few minutes.',
  },
});

/**
 * Strict rate limiter for Cloudinary PPT presentation deck uploads
 */
export const pptUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 upload attempts per 15 min window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TOO_MANY_REQUESTS',
    message: 'PPT upload limit reached (max 10 attempts per 15 minutes). Please wait before re-uploading.',
  },
});
