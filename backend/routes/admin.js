const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isAdminEmail } = require('../config/admins');
const logger = require('../utils/logger');

// GET /api/admin/check - Check if current user is an admin
// This endpoint requires authentication but doesn't require admin privileges
router.get('/check', auth, async (req, res) => {
  try {
    const email = req.session && req.session.user && req.session.user.email;
    const isAdmin = email ? isAdminEmail(email) : false;
    
    res.json({ 
      isAdmin,
      email: email || null
    });
  } catch (err) {
    logger.error('Admin check error:', err);
    res.status(500).json({ error: 'Failed to check admin status' });
  }
});

module.exports = router;
