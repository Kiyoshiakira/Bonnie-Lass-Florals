/**
 * Product Reviews Module
 * Handles displaying, creating, editing, and deleting product reviews
 */

const API_BASE_URL = 'https://bonnie-lass-florals.onrender.com/api';

/**
 * Get authentication token from Firebase
 */
async function getAuthToken() {
  if (!firebase.auth().currentUser) {
    return null;
  }
  try {
    return await firebase.auth().currentUser.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Fetch reviews for a product
 */
async function fetchReviews(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

/**
 * Fetch review statistics for a product
 */
async function fetchReviewStats(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch review stats');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return { averageRating: 0, totalReviews: 0, ratingDistribution: {} };
  }
}

/**
 * Create a new review
 */
async function createReview(productId, rating, comment) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('You must be logged in to submit a review');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId,
        rating,
        comment
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create review');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

/**
 * Update an existing review
 */
async function updateReview(reviewId, rating, comment) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('You must be logged in to update a review');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rating,
        comment
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update review');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
}

/**
 * Delete a review
 */
async function deleteReview(reviewId) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('You must be logged in to delete a review');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete review');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
}

/**
 * Render stars for a rating
 */
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '⯨';
  stars += '☆'.repeat(emptyStars);
  
  return stars;
}

/**
 * Format date to relative time
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Render the review form
 */
function renderReviewForm(productId, onSubmit, onCancel) {
  return `
    <div class="review-form" id="review-form-${productId}">
      <h4>Write a Review</h4>
      <div class="form-group">
        <label>Rating *</label>
        <div class="rating-input">
          <input type="radio" name="rating-${productId}" id="star5-${productId}" value="5" required>
          <label for="star5-${productId}">★</label>
          <input type="radio" name="rating-${productId}" id="star4-${productId}" value="4">
          <label for="star4-${productId}">★</label>
          <input type="radio" name="rating-${productId}" id="star3-${productId}" value="3">
          <label for="star3-${productId}">★</label>
          <input type="radio" name="rating-${productId}" id="star2-${productId}" value="2">
          <label for="star2-${productId}">★</label>
          <input type="radio" name="rating-${productId}" id="star1-${productId}" value="1">
          <label for="star1-${productId}">★</label>
        </div>
      </div>
      <div class="form-group">
        <label for="comment-${productId}">Your Review</label>
        <textarea 
          id="comment-${productId}" 
          name="comment"
          placeholder="Share your thoughts about this product..."
          maxlength="1000"
        ></textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="submit-btn" onclick="submitReview('${productId}')">Submit Review</button>
        <button type="button" class="cancel-btn" onclick="cancelReviewForm('${productId}')">Cancel</button>
      </div>
      <div id="review-error-${productId}" class="review-error" style="display:none;"></div>
    </div>
  `;
}

/**
 * Render reviews list
 */
function renderReviews(productId, reviews) {
  if (reviews.length === 0) {
    return '<div class="no-reviews">No reviews yet. Be the first to review this product!</div>';
  }
  
  const currentUser = firebase.auth().currentUser;
  const currentUserId = currentUser ? currentUser.uid : null;
  
  return reviews.map(review => {
    const isOwner = currentUserId === review.user;
    const actions = isOwner ? `
      <div class="review-actions">
        <button onclick="deleteReviewHandler('${productId}', '${review._id}')">Delete</button>
      </div>
    ` : '';
    
    return `
      <div class="review-item" id="review-${review._id}">
        <div class="review-header">
          <div>
            <div class="review-author">${escapeHtml(review.userName || 'Anonymous')}</div>
            <div class="review-rating">${renderStars(review.rating)}</div>
            <div class="review-date">${formatDate(review.createdAt)}</div>
          </div>
        </div>
        ${review.comment ? `<div class="review-comment">${escapeHtml(review.comment)}</div>` : ''}
        ${actions}
      </div>
    `;
  }).join('');
}

/**
 * Show review form for a product
 */
function showReviewForm(productId) {
  const container = document.getElementById(`reviews-list-${productId}`);
  if (!container) return;
  
  // Check if user is logged in
  if (!firebase.auth().currentUser) {
    alert('Please log in to write a review');
    // Trigger login modal
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.click();
    return;
  }
  
  // Check if form already exists
  if (document.getElementById(`review-form-${productId}`)) {
    return;
  }
  
  // Insert form at the top of reviews list
  container.insertAdjacentHTML('afterbegin', renderReviewForm(productId));
}

/**
 * Cancel review form
 */
function cancelReviewForm(productId) {
  const form = document.getElementById(`review-form-${productId}`);
  if (form) {
    form.remove();
  }
}

/**
 * Submit a review
 */
async function submitReview(productId) {
  const ratingInput = document.querySelector(`input[name="rating-${productId}"]:checked`);
  const commentInput = document.getElementById(`comment-${productId}`);
  const errorDiv = document.getElementById(`review-error-${productId}`);
  
  if (!ratingInput) {
    errorDiv.textContent = 'Please select a rating';
    errorDiv.style.display = 'block';
    return;
  }
  
  const rating = parseInt(ratingInput.value);
  const comment = commentInput.value.trim();
  
  try {
    errorDiv.style.display = 'none';
    await createReview(productId, rating, comment);
    
    // Refresh reviews
    cancelReviewForm(productId);
    await loadProductReviews(productId);
    
    // Show success message
    alert('Review submitted successfully!');
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.style.display = 'block';
  }
}

/**
 * Delete a review
 */
async function deleteReviewHandler(productId, reviewId) {
  if (!confirm('Are you sure you want to delete this review?')) {
    return;
  }
  
  try {
    await deleteReview(reviewId);
    await loadProductReviews(productId);
    alert('Review deleted successfully');
  } catch (error) {
    alert('Failed to delete review: ' + error.message);
  }
}

/**
 * Load and display reviews for a product
 */
async function loadProductReviews(productId) {
  const container = document.getElementById(`reviews-list-${productId}`);
  if (!container) return;
  
  try {
    const reviews = await fetchReviews(productId);
    container.innerHTML = renderReviews(productId, reviews);
  } catch (error) {
    console.error('Error loading reviews:', error);
    container.innerHTML = '<div class="review-error">Failed to load reviews</div>';
  }
}

/**
 * Initialize reviews for a product card
 */
async function initProductReviews(productId) {
  const stats = await fetchReviewStats(productId);
  const reviews = await fetchReviews(productId);
  
  return {
    stats,
    reviews,
    html: `
      <div class="product-rating">
        <span class="stars">${renderStars(stats.averageRating)}</span>
        <span class="rating-count">${stats.averageRating.toFixed(1)} (${stats.totalReviews} ${stats.totalReviews === 1 ? 'review' : 'reviews'})</span>
      </div>
      <div class="reviews-section">
        <div class="reviews-header">
          <h3>Reviews</h3>
          <button class="add-review-btn" onclick="showReviewForm('${productId}')">Write Review</button>
        </div>
        <div id="reviews-list-${productId}">
          ${renderReviews(productId, reviews)}
        </div>
      </div>
    `
  };
}

// HTML escape helper to prevent XSS
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Export functions to global scope
window.showReviewForm = showReviewForm;
window.cancelReviewForm = cancelReviewForm;
window.submitReview = submitReview;
window.deleteReviewHandler = deleteReviewHandler;
window.initProductReviews = initProductReviews;
window.loadProductReviews = loadProductReviews;
window.renderStars = renderStars;
window.fetchReviewStats = fetchReviewStats;
window.fetchReviews = fetchReviews;
