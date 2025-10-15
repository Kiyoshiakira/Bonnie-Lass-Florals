const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get current user's messages
router.get('/mine', auth, async (req, res) => {
  try {
    const userEmail = req.query.email;
    if (!userEmail) return res.status(400).json({ error: 'Email required' });

    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const messages = await Message.find({ user: user._id });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// Admin: View all messages
router.get('/all', auth, async (req, res) => {
  try {
    const messages = await Message.find({}).populate('user');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all messages.' });
  }
});

module.exports = router;
