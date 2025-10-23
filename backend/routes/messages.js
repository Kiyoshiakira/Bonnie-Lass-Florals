const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const firebaseAdminAuth = require('../middleware/firebaseAdminAuth');
const rateLimit = require('express-rate-limit');

// Rate limiter for messages API - 100 requests per 15 minutes per IP
const messagesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
router.use(messagesLimiter);

// All routes in this file require admin authentication
router.use(firebaseAdminAuth);

// GET /api/messages - Get all messages with optional filtering
router.get('/', async (req, res) => {
  try {
    const { limit, unread } = req.query;
    
    let query = {};
    
    // Filter by unread if specified
    if (unread === 'true') {
      query.read = false;
    }
    
    let messagesQuery = Message.find(query).sort({ createdAt: -1 });
    
    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit);
      if (limitNum > 0) {
        messagesQuery = messagesQuery.limit(limitNum);
      }
    }
    
    const messages = await messagesQuery;
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// GET /api/messages/unread-count - Get count of unread messages
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Message.countDocuments({ read: false });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count.' });
  }
});

// PUT /api/messages/:id/read - Mark a message as read or unread
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;
    
    // Validate read value
    if (typeof read !== 'boolean') {
      return res.status(400).json({ error: 'Invalid read value. Must be boolean.' });
    }
    
    const message = await Message.findByIdAndUpdate(
      id,
      { read },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found.' });
    }
    
    res.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message.' });
  }
});

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findByIdAndDelete(id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found.' });
    }
    
    res.json({ message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message.' });
  }
});

module.exports = router;
