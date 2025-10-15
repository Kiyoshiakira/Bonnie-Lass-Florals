// Example middleware for checking authentication

const admin = require('firebase-admin');

// Make sure to initialize Firebase Admin SDK in your main server file (backend/index.js):
// const admin = require('firebase-admin');
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(), // or specify serviceAccount
// });

module.exports = async function (req, res, next) {
  // Session-based login (legacy/local)
  if (req.session && req.session.user) {
    return next();
  }

  // Firebase/JWT token auth
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      req.session = req.session || {};
      req.session.user = {
        email: decoded.email,
        _id: decoded.uid,
        name: decoded.name || ""
      };
      return next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  // Not authenticated
  return res.status(401).json({ error: "Unauthorized" });
};
