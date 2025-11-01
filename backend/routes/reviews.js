const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Product = require('../models/Product');
const auth = require('../middleware/auth'); // General authentication for users
const logger = require('../utils/logger');

// GET /api/reviews/product/:productId - Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate productId is a valid ObjectId
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    // Sanitize by converting to ObjectId
    const sanitizedProductId = new mongoose.Types.ObjectId(productId);
    
    const reviews = await Review.find({ product: sanitizedProductId })
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    logger.error('GET /api/reviews/product/:productId error', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /api/reviews/product/:productId/stats - Get review statistics for a product
router.get('/product/:productId/stats', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate productId is a valid ObjectId
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    // Sanitize by converting to ObjectId
    const sanitizedProductId = new mongoose.Types.ObjectId(productId);
    
    const reviews = await Review.find({ product: sanitizedProductId });
    
    if (reviews.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });
    
    res.json({
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
      ratingDistribution
    });
  } catch (err) {
    logger.error('GET /api/reviews/product/:productId/stats error', err);
    res.status(500).json({ error: 'Failed to fetch review statistics' });
  }
});

// POST /api/reviews - Create a new review (requires authentication)
router.post(
  '/',
  auth,
  [
    body('productId')
      .notEmpty().withMessage('Product ID is required')
      .matches(/^[0-9a-fA-F]{24}$/).withMessage('Invalid product ID'),
    body('rating')
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isLength({ max: 1000 }).withMessage('Comment must be 1000 characters or less')
  ],
  async (req, res) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    
    try {
      const { productId, rating, comment } = req.body;
      const userId = req.user.uid;
      const userName = req.user.name || 'Anonymous';
      const userEmail = req.user.email || '';
      
      // Sanitize productId by converting to ObjectId (validation already ensures it's valid format)
      const sanitizedProductId = new mongoose.Types.ObjectId(productId);
      
      // Check if product exists
      const product = await Product.findById(sanitizedProductId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Check if user already reviewed this product
      const existingReview = await Review.findOne({
        product: sanitizedProductId,
        user: userId
      });
      
      if (existingReview) {
        return res.status(400).json({ error: 'You have already reviewed this product' });
      }
      
      // Create new review
      const review = new Review({
        product: sanitizedProductId,
        user: userId,
        userName,
        userEmail,
        rating,
        comment: comment || ''
      });
      
      await review.save();
      
      res.status(201).json(review);
    } catch (err) {
      logger.error('POST /api/reviews error', err);
      res.status(500).json({ error: 'Failed to create review' });
    }
  }
);

// PUT /api/reviews/:id - Update a review (requires authentication and ownership)
router.put(
  '/:id',
  auth,
  [
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isLength({ max: 1000 }).withMessage('Comment must be 1000 characters or less')
  ],
  async (req, res) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    
    try {
      const { id } = req.params;
      const userId = req.user.uid;
      const { rating, comment } = req.body;
      
      // Find the review
      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }
      
      // Check if user owns this review
      if (review.user !== userId) {
        return res.status(403).json({ error: 'You can only edit your own reviews' });
      }
      
      // Update review
      if (rating !== undefined) review.rating = rating;
      if (comment !== undefined) review.comment = comment;
      
      await review.save();
      
      res.json(review);
    } catch (err) {
      logger.error('PUT /api/reviews/:id error', err);
      res.status(500).json({ error: 'Failed to update review' });
    }
  }
);

// DELETE /api/reviews/:id - Delete a review (requires authentication and ownership)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    // Find the review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user owns this review
    if (review.user !== userId) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }
    
    await Review.findByIdAndDelete(id);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    logger.error('DELETE /api/reviews/:id error', err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
