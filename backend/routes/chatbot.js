const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const chatbotController = require('../controllers/chatbotController');
const logger = require('../utils/logger');

// Rate limiter for chatbot endpoints (20 requests per minute to prevent abuse)
const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Too many chatbot requests. Please wait a moment and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/chatbot/message
 * Send a message to the chatbot and get a response
 */
router.post('/message',
  chatbotLimiter,
  [
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 1000 })
      .withMessage('Message is too long (max 1000 characters)'),
    body('chatHistory')
      .optional()
      .isArray()
      .withMessage('Chat history must be an array'),
    body('chatHistory.*.role')
      .optional()
      .isIn(['user', 'assistant'])
      .withMessage('Invalid role in chat history'),
    body('chatHistory.*.content')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Chat history content cannot be empty')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Chatbot validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  chatbotController.sendMessage
);

/**
 * GET /api/chatbot/status
 * Get chatbot status and information
 */
router.get('/status', chatbotController.getStatus);

module.exports = router;
