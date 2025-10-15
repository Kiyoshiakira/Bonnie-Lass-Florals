// Example middleware for checking authentication

module.exports = function (req, res, next) {
  // If using session-based login
  if (req.session && req.session.user) {
    return next();
  }

  // If using JWT tokens (e.g., in Authorization header)
  // Uncomment if using JWTs
  /*
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    // Verify token logic here, e.g. jwt.verify(token, SECRET)
    // If valid: return next();
  }
  */

  // If not authenticated
  return res.status(401).json({ error: "Unauthorized" });
};
