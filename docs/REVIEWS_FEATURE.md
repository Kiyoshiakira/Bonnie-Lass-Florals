# Product Reviews and Ratings Feature

## Overview
This document describes the user comment and rating system implementation for products in the Bonnie Lass Florals application.

## Features Implemented

### 1. Backend API (REST)
- **Review Model**: Stores reviews with rating (1-5 stars), comment, user info, and timestamps
- **Review Endpoints**:
  - `GET /api/reviews/product/:productId` - Get all reviews for a product
  - `GET /api/reviews/product/:productId/stats` - Get review statistics (average rating, count, distribution)
  - `POST /api/reviews` - Create a review (requires authentication)
  - `PUT /api/reviews/:id` - Update a review (owner only)
  - `DELETE /api/reviews/:id` - Delete a review (owner only)

### 2. Frontend UI
- **Star Rating Display**: Shows average rating and review count on product cards
- **View Reviews Button**: Toggle button to expand/collapse reviews section
- **Review List**: Displays all reviews with:
  - Author name
  - Star rating (★★★★★)
  - Relative date (e.g., "2 days ago")
  - Comment text
  - Edit/Delete actions (for review owners)
- **Review Form**:
  - Interactive star rating selector (1-5 stars)
  - Comment text area
  - Submit/Cancel buttons
  - Login check (prompts user to log in if not authenticated)

### 3. Security Features
- **Authentication**: Firebase JWT tokens required for creating/editing/deleting reviews
- **Authorization**: Users can only edit/delete their own reviews
- **Input Validation**: 
  - Rating must be between 1-5
  - Comment limited to 1000 characters
  - ProductId validated and sanitized
- **XSS Protection**: All user input is HTML-escaped before display
- **SQL Injection Prevention**: ProductId converted to ObjectId for database queries

## Usage

### As a User
1. Browse products on the shop page
2. Click "View Reviews" on any product to see existing reviews
3. Click "Write Review" to submit your own review (requires login)
4. Select a star rating (1-5 stars)
5. Optionally add a comment
6. Submit the review

### As a Developer
```javascript
// Fetch reviews for a product
const reviews = await fetchReviews(productId);

// Get review statistics
const stats = await fetchReviewStats(productId);
// Returns: { averageRating, totalReviews, ratingDistribution }

// Create a review (requires authentication)
await createReview(productId, rating, comment);

// Delete a review (requires ownership)
await deleteReview(reviewId);
```

## Files Modified/Created

### Backend
- `backend/models/Review.js` - Review data model
- `backend/routes/reviews.js` - Review API routes (NEW)
- `backend/index.js` - Registered review routes

### Frontend
- `public/reviews.js` - Review UI logic and API calls (NEW)
- `public/shop.html` - Added reviews.js script
- `public/shop.js` - Integrated reviews into product cards
- `public/styles.css` - Added review UI styling

### Tests
- `test/review.test.js` - Review model and routes tests (NEW)

## Technical Details

### Database Schema
```javascript
{
  product: ObjectId,      // Reference to Product
  user: String,          // Firebase UID
  userName: String,      // Display name
  userEmail: String,     // User email
  rating: Number,        // 1-5
  comment: String,       // Optional
  createdAt: Date        // Auto-generated
}
```

### API Response Format
```javascript
// Single Review
{
  _id: "...",
  product: "...",
  user: "firebase-uid",
  userName: "John Doe",
  userEmail: "john@example.com",
  rating: 5,
  comment: "Great product!",
  createdAt: "2025-11-01T12:00:00Z"
}

// Review Statistics
{
  averageRating: 4.5,
  totalReviews: 10,
  ratingDistribution: {
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4
  }
}
```

## Testing
- All tests passing: 32/32
- CodeQL security scan: Passed (SQL injection vulnerabilities fixed)
- Manual testing: Pending

## Future Enhancements
- Toast notifications instead of browser alerts
- Review pagination for products with many reviews
- Review sorting (newest, highest rated, etc.)
- Review helpfulness voting
- Image uploads with reviews
- Admin moderation interface
