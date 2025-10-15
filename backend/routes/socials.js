const express = require('express');
const router = express.Router();
const Social = require('../models/Social');

// Get all social links
router.get('/', async (req, res) => {
  const socials = await Social.find();
  res.json(socials);
});

module.exports = router;