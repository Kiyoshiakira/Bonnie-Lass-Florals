/**
 * Authentication middleware
 * 
 * Checks for authentication via:
 * 1. Session-based auth (req.session.user)
 * 2. Firebase JWT token in Authorization header
 * 
 * Sets both req.user and req.session.user for backward compatibility
 */

const admin = require('../utils/firebaseAdmin');

module.exports = async function (req, res, next) {
  // Session-based login (legacy/local)
  if (req.session && req.session.user) {
    // Also set req.user for consistency
    req.user = req.session.user;
    return next();
  }

  // Firebase/JWT token auth
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      
      // Create user object from decoded token
      const user = {
        email: decoded.email,
        _id: decoded.uid,
        uid: decoded.uid,
        name: decoded.name || "",
        emailVerified: decoded.email_verified
      };
      
      // Set req.user (primary)
      req.user = user;
      
      // Also set req.session.user for backward compatibility
      req.session = req.session || {};
      req.session.user = user;
      
      return next();
    } catch (_error) {
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  // Not authenticated
  return res.status(401).json({ error: "Unauthorized" });
};
