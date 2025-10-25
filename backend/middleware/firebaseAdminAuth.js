/**
 * Firebase Admin Authentication Middleware
 * 
 * Verifies Firebase ID tokens and checks if the user is an admin
 * Uses centralized Firebase Admin initialization
 */

const admin = require('../utils/firebaseAdmin');
const { isAdminEmail } = require('../config/admins');

module.exports = async function firebaseAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    return res.status(401).json({ error: 'Missing Authorization header.' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(match[1]);
    if (!decodedToken.email || !isAdminEmail(decodedToken.email)) {
      return res.status(403).json({ error: 'Admins only.' });
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
