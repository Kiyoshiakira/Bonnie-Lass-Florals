// Handles tab switching between Handmade Crafts and Cottage Foods
function showShopSection(type) {
  document.getElementById('shop-decor').classList.remove('active');
  document.getElementById('shop-food').classList.remove('active');
  document.getElementById('decorTab').classList.remove('active');
  document.getElementById('foodTab').classList.remove('active');
  if (type === 'decor') {
    document.getElementById('shop-decor').classList.add('active');
    document.getElementById('decorTab').classList.add('active');
  } else {
    document.getElementById('shop-food').classList.add('active');
    document.getElementById('foodTab').classList.add('active');
  }
}

// API Base URL constant
const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://bonnie-lass-florals.onrender.com';

// Global products cache
let allProducts = [];
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let isAdmin = false; // Track admin status

// Load products dynamically from backend with pagination
async function loadProducts(page = 1, append = false) {
  if (isLoading) return;
  
  try {
    isLoading = true;
    
    if (!append) {
      showInlineLoading('decor-products');
      showInlineLoading('food-products');
    }
    
    // Use your Render API URL with pagination parameters
    // Note: Using limit=1000 to maintain current UX (load all products at once)
    // This can be changed to a lower limit (e.g., 20) when implementing
    // "load more" or infinite scroll functionality
    const res = await fetch(`${API_BASE}/api/products?page=${page}&limit=1000`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await res.json();
    
    // Handle both old format (array) and new format (object with products array)
    if (Array.isArray(data)) {
      // Old format - backward compatibility
      allProducts = data;
    } else {
      // New format with pagination
      if (append) {
        allProducts = [...allProducts, ...data.products];
      } else {
        allProducts = data.products;
      }
      
      if (data.pagination) {
        currentPage = data.pagination.page;
        totalPages = data.pagination.totalPages;
      }
    }
    
    renderProducts();
    
    // Initialize image zoom after products are loaded
    setTimeout(() => initImageZoom(), 100);
  } catch (err) {
    console.error('Error loading products:', err);
    document.getElementById('decor-products').innerHTML = 
      '<div style="color:#ef4444;padding:1rem;">Failed to load products. Please try again later.</div>';
    document.getElementById('food-products').innerHTML = 
      '<div style="color:#ef4444;padding:1rem;">Failed to load products. Please try again later.</div>';
  } finally {
    isLoading = false;
  }
}

// Render products with current filters
function renderProducts() {
  const decor = allProducts.filter(p => p.type === 'decor');
  const food = allProducts.filter(p => p.type === 'food');
  
  document.getElementById('decor-products').innerHTML = decor.length > 0 
    ? decor.map(productToCard).join('') 
    : '<div style="color:#888;padding:1rem;">No products found.</div>';
    
  document.getElementById('food-products').innerHTML = food.length > 0 
    ? food.map(productToCard).join('') 
    : '<div style="color:#888;padding:1rem;">No products found.</div>';
  
  // Add fade-in animation to product cards
  setTimeout(() => {
    document.querySelectorAll('.product-card').forEach((card, index) => {
      card.style.opacity = '0';
      setTimeout(() => {
        card.classList.add('fade-in');
        card.style.opacity = '1';
      }, index * 50);
    });
    initImageZoom();
    initCarousels(); // Initialize image carousels
    
    // Load ratings for all products
    if (window.fetchReviewStats) {
      loadProductRatings();
    }
  }, 50);
  
  // Setup event delegation for add-to-cart buttons (only once)
  setupAddToCartHandlers();
}

// Apply filters to products
function applyFilters(type) {
  const sortBy = document.getElementById(`${type}Sort`)?.value || 'default';
  const stockFilter = document.getElementById(`${type}Stock`)?.value || 'all';
  const collectionFilter = document.getElementById(`${type}Collection`)?.value || 'all';
  const occasionFilter = document.getElementById(`${type}Occasion`)?.value || 'all';
  
  let filtered = allProducts.filter(p => p.type === type);
  
  // Apply stock filter
  if (stockFilter === 'in-stock') {
    filtered = filtered.filter(p => (p.stock || 0) > 0);
  } else if (stockFilter === 'out-of-stock') {
    filtered = filtered.filter(p => (p.stock || 0) === 0);
  }
  
  // Apply collection filter (only for decor/handmade crafts)
  if (type === 'decor' && collectionFilter !== 'all') {
    filtered = filtered.filter(p => p.collection === collectionFilter);
  }
  
  // Apply occasion filter (only for decor/handmade crafts)
  if (type === 'decor' && occasionFilter !== 'all') {
    filtered = filtered.filter(p => p.occasion === occasionFilter);
  }
  
  // Apply sorting
  if (sortBy === 'price-low') {
    filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }
  
  const containerId = type === 'decor' ? 'decor-products' : 'food-products';
  document.getElementById(containerId).innerHTML = filtered.length > 0 
    ? filtered.map(productToCard).join('') 
    : '<div style="color:#888;padding:1rem;">No products found.</div>';
  
  // Add fade-in animation
  setTimeout(() => {
    document.querySelectorAll(`#${containerId} .product-card`).forEach((card, index) => {
      card.style.opacity = '0';
      setTimeout(() => {
        card.classList.add('fade-in');
        card.style.opacity = '1';
      }, index * 50);
    });
    initImageZoom();
    initCarousels(); // Initialize image carousels
    
    // Load ratings for filtered products
    if (window.fetchReviewStats) {
      loadProductRatings();
    }
  }, 50);
  
  // Re-setup event handlers after filtering
  setupAddToCartHandlers();
}

// Reset filters
function resetFilters(type) {
  const sortSelect = document.getElementById(`${type}Sort`);
  const stockSelect = document.getElementById(`${type}Stock`);
  const collectionSelect = document.getElementById(`${type}Collection`);
  const occasionSelect = document.getElementById(`${type}Occasion`);
  
  if (sortSelect) sortSelect.value = 'default';
  if (stockSelect) stockSelect.value = 'all';
  if (collectionSelect) collectionSelect.value = 'all';
  if (occasionSelect) occasionSelect.value = 'all';
  
  renderProducts();
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

// Attribute escape helper for safe attribute values
function escapeAttr(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Event delegation handler for add-to-cart buttons
let addToCartHandlersSetup = false;
function setupAddToCartHandlers() {
  if (addToCartHandlersSetup) return; // Only setup once
  
  // Use event delegation on the container elements
  document.getElementById('decor-products').addEventListener('click', handleAddToCart);
  document.getElementById('food-products').addEventListener('click', handleAddToCart);
  
  addToCartHandlersSetup = true;
}

function handleAddToCart(event) {
  const button = event.target.closest('.add-to-cart');
  if (!button) return; // Click was not on an add-to-cart button
  
  const productId = button.dataset.id;
  if (!productId) return;
  
  // Find the product in our cached array
  const product = allProducts.find(p => p._id === productId);
  if (!product) {
    console.error('Product not found:', productId);
    return;
  }
  
  // Call the existing addToCart function from cart.js
  if (typeof addToCart === 'function') {
    addToCart({
      name: product.name,
      price: product.price,
      id: product._id,
      image: product.image
    });
  }
}

function productToCard(p) {
  const stock = p.stock !== undefined ? p.stock : 0;
  let stockClass = '';
  let stockText = `Stock: ${stock}`;
  
  if (stock === 0) {
    stockClass = 'out-of-stock';
    stockText = 'Out of Stock';
  } else if (stock <= 5) {
    stockClass = 'low-stock';
    stockText = `Low Stock: ${stock} left`;
  }
  
  const isOutOfStock = stock === 0;
  
  // Get all images for the product
  const images = (p.images && p.images.length > 0) 
    ? p.images 
    : (p.image ? [p.image] : ['/img/default-product.png']);
  
  const productName = escapeHtml(p.name);
  const productDesc = escapeHtml(p.description || '');
  const productPrice = p.price && !isNaN(p.price) ? Number(p.price).toFixed(2) : 'N/A';
  
  // Escape options if present
  const optionsHtml = p.options && p.options.length 
    ? `<div style="font-size:0.9em;color:#666;margin-bottom:0.5em;"><strong>Options:</strong> ${p.options.map(escapeHtml).join(', ')}</div>` 
    : '';
  
  // Generate image carousel or single image
  let imageHtml;
  if (images.length > 1) {
    // Multi-image carousel
    const carouselId = `carousel-${escapeAttr(p._id)}`;
    imageHtml = `
      <div class="product-image-carousel" id="${carouselId}">
        ${images.map((img, idx) => {
          const imageUrl = img && img.trim() ? escapeAttr(img) : '/img/default-product.png';
          return generateResponsiveImage(imageUrl, `${productName} - Image ${idx + 1}`);
        }).join('')}
        ${images.length > 1 ? `
          <button class="carousel-prev" onclick="prevImage('${carouselId}')">‹</button>
          <button class="carousel-next" onclick="nextImage('${carouselId}')">›</button>
          <div class="carousel-indicators">
            ${images.map((_, idx) => `<span class="indicator ${idx === 0 ? 'active' : ''}" onclick="goToImage('${carouselId}', ${idx})"></span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  } else {
    // Single image
    const imageUrl = images[0] && images[0].trim() ? escapeAttr(images[0]) : '/img/default-product.png';
    imageHtml = generateResponsiveImage(imageUrl, productName);
  }
  
  return `
    <div class="product-card" id="product-${escapeAttr(p._id)}">
      <div class="product-top-section">
        ${imageHtml}
        <div class="product-info">
          <div class="product-title">${productName}</div>
          <div class="product-price">$${productPrice}</div>
          <div class="product-stock ${stockClass}">${stockText}</div>
          <div id="product-rating-${escapeAttr(p._id)}"></div>
          ${optionsHtml}
        </div>
      </div>
      <div class="product-bottom-section">
        <div class="product-desc">${productDesc}</div>
        <button 
          class="add-to-cart"
          data-id="${escapeAttr(p._id)}"
          ${isOutOfStock ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}
        >
          ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
        <button 
          class="view-reviews-btn"
          style="margin-top:0.5rem;background:linear-gradient(135deg,#52b788 0%,#40916c 100%);color:#fff;border:none;border-radius:8px;padding:0.4em 1em;font-weight:600;font-size:0.85em;cursor:pointer;width:100%;"
          onclick="toggleReviews('${escapeAttr(p._id)}')"
        >
          View Reviews
        </button>
        ${isAdmin ? `<button 
          class="edit-product-btn"
          data-id="${escapeAttr(p._id)}"
          onclick="openEditProductModal('${escapeAttr(p._id)}')"
        >
          Edit Product
        </button>` : ''}
        <div id="reviews-container-${escapeAttr(p._id)}" style="display:none;"></div>
      </div>
    </div>
  `;
}

/**
 * Generate responsive image HTML with proper attributes for performance
 * @param {string} imageUrl - URL of the image
 * @param {string} altText - Alt text for accessibility
 * @returns {string} HTML string for responsive image
 */
function generateResponsiveImage(imageUrl, altText) {
  // Check if this is a WebP image (Firebase Storage or external URL)
  const isWebP = imageUrl.toLowerCase().includes('.webp');
  
  // For WebP images, provide JPEG fallback if available
  // For now, we use picture element to support WebP with fallback
  if (isWebP) {
    // Extract base URL without extension for potential fallback
    const baseUrl = imageUrl.replace(/\.webp$/i, '');
    const jpegUrl = baseUrl + '.jpg';
    
    return `
      <picture>
        <source srcset="${imageUrl}" type="image/webp">
        <img 
          src="${jpegUrl}" 
          alt="${altText}" 
          class="product-img" 
          loading="lazy" 
          width="150" 
          height="150"
          decoding="async"
        />
      </picture>
    `;
  }
  
  // For non-WebP images, use standard img tag with responsive attributes
  // sizes attribute tells browser how wide the image will be at different viewport widths
  // - Mobile (< 640px): image takes ~100% of viewport
  // - Tablet (640px-1024px): image takes ~50% of viewport (2 columns)
  // - Desktop (> 1024px): image takes ~33% of viewport (3 columns)
  return `
    <img 
      src="${imageUrl}" 
      alt="${altText}" 
      class="product-img" 
      loading="lazy" 
      width="150" 
      height="150"
      decoding="async"
    />
  `;
}

// Carousel navigation functions
function nextImage(carouselId) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  
  const images = carousel.querySelectorAll('.product-img');
  const indicators = carousel.querySelectorAll('.indicator');
  let currentIndex = -1;
  
  // Find current visible image
  images.forEach((img, idx) => {
    if (img.style.display !== 'none') {
      currentIndex = idx;
    }
  });
  
  if (currentIndex === -1) currentIndex = 0;
  
  // Hide current, show next
  images[currentIndex].style.display = 'none';
  indicators[currentIndex]?.classList.remove('active');
  
  const nextIndex = (currentIndex + 1) % images.length;
  images[nextIndex].style.display = 'block';
  indicators[nextIndex]?.classList.add('active');
}

function prevImage(carouselId) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  
  const images = carousel.querySelectorAll('.product-img');
  const indicators = carousel.querySelectorAll('.indicator');
  let currentIndex = -1;
  
  // Find current visible image
  images.forEach((img, idx) => {
    if (img.style.display !== 'none') {
      currentIndex = idx;
    }
  });
  
  if (currentIndex === -1) currentIndex = 0;
  
  // Hide current, show previous
  images[currentIndex].style.display = 'none';
  indicators[currentIndex]?.classList.remove('active');
  
  const prevIndex = (currentIndex - 1 + images.length) % images.length;
  images[prevIndex].style.display = 'block';
  indicators[prevIndex]?.classList.add('active');
}

function goToImage(carouselId, targetIndex) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  
  const images = carousel.querySelectorAll('.product-img');
  const indicators = carousel.querySelectorAll('.indicator');
  
  // Hide all images and deactivate all indicators
  images.forEach((img, idx) => {
    img.style.display = idx === targetIndex ? 'block' : 'none';
    if (indicators[idx]) {
      if (idx === targetIndex) {
        indicators[idx].classList.add('active');
      } else {
        indicators[idx].classList.remove('active');
      }
    }
  });
}

// Initialize carousel images (hide all except first)
function initCarousels() {
  document.querySelectorAll('.product-image-carousel').forEach(carousel => {
    const images = carousel.querySelectorAll('.product-img');
    images.forEach((img, idx) => {
      img.style.display = idx === 0 ? 'block' : 'none';
    });
  });
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', loadProducts);

// Function to toggle reviews display
async function toggleReviews(productId) {
  const container = document.getElementById(`reviews-container-${productId}`);
  const button = container.previousElementSibling;
  
  if (container.style.display === 'none') {
    // Show reviews
    container.style.display = 'block';
    button.textContent = 'Hide Reviews';
    
    // Load reviews if not already loaded
    if (!container.dataset.loaded) {
      try {
        const reviewData = await window.initProductReviews(productId);
        container.innerHTML = reviewData.html;
        container.dataset.loaded = 'true';
      } catch (error) {
        console.error('Error loading reviews:', error);
        container.innerHTML = '<div class="review-error">Failed to load reviews</div>';
      }
    }
  } else {
    // Hide reviews
    container.style.display = 'none';
    button.textContent = 'View Reviews';
  }
}

// Fix: Throttle review stats requests to avoid overwhelming the API (prevents 429 errors)
// Maximum number of parallel requests to the reviews API
const MAX_PARALLEL_REVIEW_REQUESTS = 6;

// Delay between batches (in milliseconds)
const BATCH_DELAY_MS = 200;

// Function to load rating stars for all products with batching to prevent API overload
async function loadProductRatings() {
  const productCards = document.querySelectorAll('.product-card');
  
  // Collect all product IDs that need ratings
  const productIds = [];
  for (const card of productCards) {
    const productId = card.id.replace('product-', '');
    if (productId) {
      productIds.push(productId);
    }
  }
  
  // Fix: Process product IDs in chunks to limit parallel requests
  // This prevents overwhelming the reviews API and reduces 429 rate limit errors
  for (let i = 0; i < productIds.length; i += MAX_PARALLEL_REVIEW_REQUESTS) {
    const chunk = productIds.slice(i, i + MAX_PARALLEL_REVIEW_REQUESTS);
    
    // Process this chunk in parallel (up to MAX_PARALLEL requests)
    await Promise.all(
      chunk.map(async (productId) => {
        const ratingContainer = document.getElementById(`product-rating-${productId}`);
        if (!ratingContainer) return;
        
        try {
          // Keep existing fetchReviewStats function unchanged
          const stats = await window.fetchReviewStats(productId);
          if (stats.totalReviews > 0) {
            ratingContainer.innerHTML = `
              <div class="product-rating">
                <span class="stars">${window.renderStars(stats.averageRating)}</span>
                <span class="rating-count">${stats.averageRating.toFixed(1)} (${stats.totalReviews})</span>
              </div>
            `;
          }
        } catch (error) {
          console.error('Error loading rating for product:', productId, error);
        }
      })
    );
    
    // Fix: Add delay between chunks to prevent API rate limiting
    // Only add delay if there are more chunks to process
    if (i + MAX_PARALLEL_REVIEW_REQUESTS < productIds.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }
}

// Helper function to format options for display (array to comma-separated string)
function formatOptionsForDisplay(options) {
  if (!options) return '';
  return Array.isArray(options) ? options.join(', ') : String(options);
}

// Helper function to parse options from input (comma-separated string to array)
function parseOptionsFromInput(optionsString) {
  if (!optionsString || !optionsString.trim()) return [];
  return optionsString.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Upload image file to Firebase Storage
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Download URL from Firebase Storage
 */
async function uploadImageToFirebase(file) {
  // Constants for validation
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MIN_FILENAME_LENGTH = 3;
  const MAX_FILENAME_LENGTH = 100;
  
  // Fix: Check authentication before attempting upload to prevent runtime errors
  if (!firebase.auth().currentUser) {
    const errorMsg = 'Authentication required: You must be logged in to upload images.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
  }
  
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit.');
  }
  
  // Fix: Wrap upload logic in try/catch for better error handling
  try {
    const storage = firebase.storage();
    // Fix: Use template literal for storage path to ensure proper string interpolation
    const timestamp = Date.now();
    
    // Enhanced filename sanitization - remove special chars and path traversal
    let safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')  // Replace unsafe chars with underscore
      .replace(/\.{2,}/g, '_')            // Remove path traversal sequences
      .replace(/^\.+/, '')                // Remove leading dots
      .substring(0, MAX_FILENAME_LENGTH); // Limit filename length
    
    // Fallback to default name if sanitization results in empty or very short name
    if (!safeName || safeName.length < MIN_FILENAME_LENGTH) {
      const extension = file.type.split('/')[1] || 'jpg';
      safeName = `image.${extension}`;
    }
    
    const filename = `${timestamp}-${safeName}`;
    // Fix: Use template literal for storage reference path
    const imageRef = storage.ref(`product-images/${filename}`);
    
    // Upload file to Firebase Storage with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString()
      }
    };
    
    const snapshot = await imageRef.put(file, metadata);
    
    // Get the download URL
    const downloadURL = await snapshot.ref.getDownloadURL();
    return downloadURL;
  } catch (error) {
    // Fix: Enhanced error handling with detailed logging
    const errorMsg = `Image upload failed: ${error.message || 'Unknown error'}`;
    console.error(errorMsg, error);
    
    // Fix: Show user-friendly notification if available
    if (typeof showNotification === 'function') {
      showNotification(errorMsg, 'error');
    }
    
    throw new Error(errorMsg);
  }
}

// Edit Product Modal Functions (Admin Only)
function openEditProductModal(productId) {
  const product = allProducts.find(p => p._id === productId);
  const errorDiv = document.getElementById('editProductError');
  
  if (!product) {
    errorDiv.textContent = 'Product not found';
    errorDiv.style.display = 'block';
    return;
  }
  
  // Populate form fields
  document.getElementById('editProductId').value = product._id;
  document.getElementById('editProductName').value = product.name || '';
  document.getElementById('editProductDescription').value = product.description || '';
  document.getElementById('editProductPrice').value = product.price || '';
  document.getElementById('editProductType').value = product.type || 'decor';
  document.getElementById('editProductStock').value = product.stock !== undefined ? product.stock : 1;
  document.getElementById('editProductOptions').value = formatOptionsForDisplay(product.options);
  
  // Get all images for this product
  const images = product.images || (product.image ? [product.image] : []);
  
  // Display all current images
  const imagePreviewDiv = document.getElementById('editCurrentImagePreview');
  if (imagePreviewDiv) {
    if (images.length > 0) {
      imagePreviewDiv.innerHTML = images.map((img, idx) => 
        `<div style="position:relative;">
          <img src="${escapeAttr(img)}" style="max-width:120px;max-height:120px;object-fit:cover;border-radius:4px;border:1px solid #ddd;" alt="Product image ${idx + 1}">
          <div style="position:absolute;top:4px;left:4px;background:rgba(0,0,0,0.6);color:#fff;padding:2px 6px;border-radius:3px;font-size:0.75rem;">${idx + 1}</div>
        </div>`
      ).join('');
    } else {
      imagePreviewDiv.innerHTML = '<div style="color:#999;">No images</div>';
    }
  }
  
  // Set image URLs textarea
  const imageUrlsField = document.getElementById('editProductImageUrls');
  if (imageUrlsField) {
    imageUrlsField.value = images.join('\n');
  }
  
  // Clear file input
  const fileInput = document.getElementById('editProductImageFiles');
  if (fileInput) {
    fileInput.value = '';
  }
  
  // Clear progress message
  const progressDiv = document.getElementById('editImageUploadProgress');
  if (progressDiv) {
    progressDiv.textContent = '';
  }
  
  // Clear previous messages
  errorDiv.style.display = 'none';
  document.getElementById('editProductSuccess').style.display = 'none';
  
  // Show modal
  const modal = document.getElementById('editProductModal');
  modal.style.display = 'flex';
}

function closeEditProductModal() {
  const modal = document.getElementById('editProductModal');
  modal.style.display = 'none';
}

// Handle edit form submission
async function handleEditProductSubmit(e) {
  e.preventDefault();
  
  const productId = document.getElementById('editProductId').value;
  const errorDiv = document.getElementById('editProductError');
  const successDiv = document.getElementById('editProductSuccess');
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const progressDiv = document.getElementById('editImageUploadProgress');
  
  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';
  if (progressDiv) progressDiv.textContent = '';
  
  try {
    // Get Firebase auth token
    const user = firebase.auth().currentUser;
    if (!user) {
      errorDiv.textContent = 'Please login first';
      errorDiv.style.display = 'block';
      return;
    }
    
    const token = await user.getIdToken();
    
    // Prepare update data
    const updateData = {
      name: document.getElementById('editProductName').value,
      description: document.getElementById('editProductDescription').value,
      price: parseFloat(document.getElementById('editProductPrice').value),
      type: document.getElementById('editProductType').value,
      stock: parseInt(document.getElementById('editProductStock').value),
      options: parseOptionsFromInput(document.getElementById('editProductOptions').value)
    };
    
    // Collect image URLs
    const imageUrls = [];
    
    // Get image URLs from textarea
    const imageUrlsText = document.getElementById('editProductImageUrls');
    if (imageUrlsText && imageUrlsText.value) {
      const urls = imageUrlsText.value
        .split(/[\n,]/)
        .map(url => url.trim())
        .filter(url => url && url.startsWith('http'));
      imageUrls.push(...urls);
    }
    
    // Upload new image files if provided
    const fileInput = document.getElementById('editProductImageFiles');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      if (submitBtn) {
        submitBtn.disabled = true;
      }
      
      const totalFiles = fileInput.files.length;
      for (let i = 0; i < totalFiles; i++) {
        const file = fileInput.files[i];
        if (submitBtn) {
          submitBtn.textContent = `Uploading image ${i + 1}/${totalFiles}...`;
        }
        if (progressDiv) {
          progressDiv.textContent = `Uploading image ${i + 1} of ${totalFiles}...`;
        }
        
        try {
          const imageUrl = await uploadImageToFirebase(file);
          imageUrls.push(imageUrl);
        } catch (uploadErr) {
          console.error(`Failed to upload image ${i + 1}:`, uploadErr);
          if (progressDiv) {
            progressDiv.textContent = `Warning: Failed to upload image ${i + 1}. Continuing...`;
          }
          // Continue with other images
        }
      }
    }
    
    // Set images array in update data
    if (imageUrls.length > 0) {
      updateData.images = imageUrls;
    }
    
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving changes...';
    }
    if (progressDiv) {
      progressDiv.textContent = 'Saving changes...';
    }
    
    // Send PUT request to update product
    const response = await fetch(`${API_BASE}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update product');
    }
    
    // Success - show message and reload products
    successDiv.textContent = 'Product updated successfully!';
    successDiv.style.display = 'block';
    
    // Reload products to reflect changes
    setTimeout(async () => {
      await loadProducts();
      closeEditProductModal();
    }, 1500);
    
  } catch (error) {
    console.error('Error updating product:', error);
    errorDiv.textContent = error.message || 'Failed to update product';
    errorDiv.style.display = 'block';
  } finally {
    // Reset button state
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  }
}

// Initialize edit modal event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Cancel button
  const cancelBtn = document.getElementById('cancelEditProduct');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeEditProductModal);
  }
  
  // Form submission
  const editForm = document.getElementById('editProductForm');
  if (editForm) {
    editForm.addEventListener('submit', handleEditProductSubmit);
  }
  
  // Close modal when clicking outside
  const modal = document.getElementById('editProductModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeEditProductModal();
      }
    });
  }
});

// Check admin status on auth state change
if (window.firebase && firebase.auth) {
  firebase.auth().onAuthStateChanged(async function(user) {
    if (user) {
      // Check if user is admin
      try {
        // Force token refresh to get latest custom claims
        const token = await user.getIdToken(true);
        const response = await fetch(`${API_BASE}/api/admin/check`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          isAdmin = data.isAdmin === true;
          // Re-render products to show/hide edit buttons
          if (allProducts.length > 0) {
            renderProducts();
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        isAdmin = false;
      }
    } else {
      isAdmin = false;
      // Re-render products to hide edit buttons
      if (allProducts.length > 0) {
        renderProducts();
      }
    }
  });
}

// Expose functions to global scope for HTML onclick
window.showShopSection = showShopSection;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.toggleReviews = toggleReviews;
window.openEditProductModal = openEditProductModal;
