// Firebase Admin SDK for verifying ID tokens
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
    // Optionally: Add storageBucket/projectId if needed
  });
}

// List of admin emails (lowercase!)
const ADMIN_EMAILS = [
  "shaunessy24@gmail.com",
  "bonnielassflorals@gmail.com"
];

module.exports = async function firebaseAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    return res.status(401).json({ error: 'Missing Authorization header.' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(match[1]);
    if (!decodedToken.email || !ADMIN_EMAILS.includes(decodedToken.email.toLowerCase())) {
      return res.status(403).json({ error: 'Admins only.' });
    }
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
