/**
 * Local storage fallback utilities
 * Provides compatibility with legacy file uploads stored on local filesystem
 * 
 * NOTE: Firebase Storage is now the primary storage method.
 * Local uploads are kept as a fallback for compatibility with existing images.
 */

const path = require('path');
const fs = require('fs');
const logger = require('./logger');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'admin', 'uploads');

/**
 * Check if a file exists in the local upload directory
 * @param {string} filename - Filename to check
 * @returns {boolean} True if file exists
 */
function fileExists(filename) {
  try {
    const fullPath = path.join(UPLOAD_DIR, filename);
    return fs.existsSync(fullPath);
  } catch (_err) {
    return false;
  }
}

/**
 * Get full path for a local upload file
 * @param {string} filename - Filename
 * @returns {string} Full filesystem path
 */
function getFilePath(filename) {
  return path.join(UPLOAD_DIR, filename);
}

/**
 * Delete a file from local uploads
 * @param {string} filename - Filename to delete
 * @returns {boolean} True if file was deleted
 */
function deleteFile(filename) {
  try {
    const fullPath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (err) {
    logger.error('Error deleting file:', err);
    return false;
  }
}

/**
 * Check if an image URL/path is a local upload
 * @param {string} imageUrl - Image URL or path
 * @returns {boolean} True if it's a local upload path
 */
function isLocalUpload(imageUrl) {
  if (!imageUrl) return false;
  return imageUrl.includes('/admin/uploads/');
}

/**
 * Extract filename from local upload path
 * @param {string} imageUrl - Image URL or path like "/admin/uploads/123-image.jpg"
 * @returns {string} Filename or empty string
 */
function getFilenameFromPath(imageUrl) {
  if (!imageUrl || !isLocalUpload(imageUrl)) return '';
  return imageUrl.replace('/admin/uploads/', '');
}

module.exports = {
  UPLOAD_DIR,
  fileExists,
  getFilePath,
  deleteFile,
  isLocalUpload,
  getFilenameFromPath
};
