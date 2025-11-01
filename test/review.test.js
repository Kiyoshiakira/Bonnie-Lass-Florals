const { expect } = require('chai');

describe('Review Routes Tests', function() {
  it('should export review routes module', function() {
    const reviewRoutes = require('../backend/routes/reviews');
    expect(reviewRoutes).to.be.a('function');
  });

  it('should have Review model with correct schema', function() {
    const Review = require('../backend/models/Review');
    const review = new Review({
      product: '507f1f77bcf86cd799439011',
      user: 'firebase-uid-123',
      userName: 'Test User',
      userEmail: 'test@example.com',
      rating: 5,
      comment: 'Great product!'
    });
    
    expect(review.product.toString()).to.equal('507f1f77bcf86cd799439011');
    expect(review.user).to.equal('firebase-uid-123');
    expect(review.userName).to.equal('Test User');
    expect(review.rating).to.equal(5);
    expect(review.comment).to.equal('Great product!');
  });

  it('should enforce rating constraints', function() {
    const Review = require('../backend/models/Review');
    const review = new Review({
      product: '507f1f77bcf86cd799439011',
      user: 'firebase-uid-123',
      rating: 10
    });
    
    const validationError = review.validateSync();
    expect(validationError).to.exist;
    expect(validationError.errors.rating).to.exist;
  });

  it('should require product and user fields', function() {
    const Review = require('../backend/models/Review');
    const review = new Review({
      rating: 5
    });
    
    const validationError = review.validateSync();
    expect(validationError).to.exist;
    expect(validationError.errors.product).to.exist;
    expect(validationError.errors.user).to.exist;
  });
});
