/**
 * Centralized admin configuration
 * 
 * To add a new admin:
 * 1. Add their email address (lowercase) to the ADMIN_EMAILS array below
 * 2. Restart the backend server
 * 
 * Note: Admin emails should always be stored in lowercase for consistent comparison
 */

const ADMIN_EMAILS = [
  'shaunessy24@gmail.com',
  'bonnielassflorals@gmail.com'
];

/**
 * Check if an email belongs to an admin user
 * @param {string} email - The email address to check
 * @returns {boolean} - True if the email is an admin, false otherwise
 */
function isAdminEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Get the list of admin emails (for reference, not for exposing to clients)
 * @returns {string[]} - Array of admin email addresses
 */
function getAdminEmails() {
  return [...ADMIN_EMAILS]; // Return a copy to prevent modification
}

module.exports = {
  ADMIN_EMAILS,
  isAdminEmail,
  getAdminEmails
};
