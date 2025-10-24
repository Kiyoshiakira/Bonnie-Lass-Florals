/**
 * Centralized image URL normalization utilities
 * Handles converting relative paths to absolute URLs for clients
 */

const BACKEND_URL = process.env.BACKEND_URL || '';

/**
 * Normalize image URLs to absolute URLs
 * Priority: absolute URLs (Firebase Storage, etc.) > BACKEND_URL for relative paths
 * @param {string} image - Image URL or path
 * @returns {string} Normalized absolute URL or empty string
 */
function normalizeImageUrl(image) {
  if (!image) return '';
  
  // If already an absolute URL (http:// or https://), return as-is
  // This includes Firebase Storage URLs and other external URLs
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  
  // If BACKEND_URL is not set, return the relative path as-is
  // This allows for local development or when serving from same domain
  if (!BACKEND_URL) {
    return image.startsWith('/') ? image : '/' + image;
  }
  
  // Convert relative path to absolute URL using BACKEND_URL
  // This handles legacy /admin/uploads/ paths for old images
  if (image.startsWith('/')) {
    return BACKEND_URL + image;
  }
  
  return BACKEND_URL + '/' + image;
}

/**
 * Normalize a product object's image URL
 * @param {Object} product - Product object (can be Mongoose document or plain object)
 * @returns {Object} Product object with normalized image URL
 */
function normalizeProduct(product) {
  const normalized = product.toObject ? product.toObject() : { ...product };
  normalized.image = normalizeImageUrl(normalized.image);
  return normalized;
}

module.exports = {
  normalizeImageUrl,
  normalizeProduct
};
