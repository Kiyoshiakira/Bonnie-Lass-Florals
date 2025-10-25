/**
 * Centralized Firebase Admin SDK initialization
 * 
 * This module ensures Firebase Admin is initialized exactly once,
 * avoiding order-of-initialization bugs when multiple modules require it.
 * 
 * Environment variables:
 * - FIREBASE_SERVICE_ACCOUNT_JSON: Optional base64 or JSON string of service account
 *   If not provided, uses applicationDefault() credentials
 */

const admin = require('firebase-admin');
const logger = require('./logger');

let initialized = false;

/**
 * Initialize Firebase Admin SDK
 * Only initializes once, subsequent calls are no-ops
 */
function initializeFirebaseAdmin() {
  if (initialized) {
    return admin;
  }

  try {
    // Check if already initialized by another module
    if (admin.apps.length > 0) {
      logger.info('Firebase Admin already initialized');
      initialized = true;
      return admin;
    }

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (serviceAccountJson) {
      // Try to parse as JSON or base64-encoded JSON
      let serviceAccount;
      try {
        // First try direct JSON parse
        serviceAccount = JSON.parse(serviceAccountJson);
      } catch (_e) {
        // If that fails, try base64 decode then parse
        try {
          const decoded = Buffer.from(serviceAccountJson, 'base64').toString('utf-8');
          serviceAccount = JSON.parse(decoded);
        } catch (_decodeError) {
          throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON or base64-encoded JSON');
        }
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      logger.info('Firebase Admin initialized with service account credentials');
    } else {
      // Use application default credentials
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      logger.info('Firebase Admin initialized with application default credentials');
    }

    initialized = true;
    return admin;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin:', error);
    throw error;
  }
}

// Initialize on module load
initializeFirebaseAdmin();

// Export the initialized admin instance
module.exports = admin;
