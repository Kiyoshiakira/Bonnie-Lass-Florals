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

// POST /api/reviews/bulk-stats - Get review statistics for multiple products in one request
// This reduces N+1 queries to a single aggregation for better performance
router.post('/bulk-stats', async (req, res) => {
  try {
    const { productIds } = req.body;
    
    // Validate input
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds must be an array' });
    }
    
    // Limit number of products to prevent abuse (max 100 products per request)
    if (productIds.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 products per request' });
    }
    
    // Filter and sanitize valid ObjectIds using mongoose's built-in validator
    const validProductIds = productIds
      .filter(id => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));
    
    if (validProductIds.length === 0) {
      return res.json({ stats: {} });
    }
    
    // Use MongoDB aggregation pipeline for efficient bulk stats
    const aggregationResult = await Review.aggregate([
      {
        $match: {
          product: { $in: validProductIds }
        }
      },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } }
        }
      }
    ]);
    
    // Transform aggregation result into a map keyed by product ID
    // Use same rounding logic as individual stats endpoint for consistency
    const stats = {};
    aggregationResult.forEach(result => {
      stats[result._id.toString()] = {
        averageRating: Math.round(result.averageRating * 10) / 10,
        totalReviews: result.totalReviews,
        ratingDistribution: {
          1: result.rating1,
          2: result.rating2,
          3: result.rating3,
          4: result.rating4,
          5: result.rating5
        }
      };
    });
    
    // Add empty stats for products with no reviews
    validProductIds.forEach(id => {
      const idStr = id.toString();
      if (!stats[idStr]) {
        stats[idStr] = {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }
    });
    
    // Set cache headers for performance (cache for 1 minute)
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    
    res.json({ stats });
  } catch (err) {
    logger.error('POST /api/reviews/bulk-stats error', err);
    res.status(500).json({ error: 'Failed to fetch bulk review statistics' });
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
