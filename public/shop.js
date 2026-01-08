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

// LocalStorage cache keys and settings for instant page loads
const PRODUCTS_CACHE_KEY = 'cachedProducts';
const PRODUCTS_CACHE_TIME_KEY = 'cachedProductsTime';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache validity

/**
 * Get cached products from localStorage for instant display
 * @returns {Array|null} Cached products array or null if cache is invalid/expired
 */
function getCachedProducts() {
  try {
    const cachedTime = localStorage.getItem(PRODUCTS_CACHE_TIME_KEY);
    const cachedData = localStorage.getItem(PRODUCTS_CACHE_KEY);
    
    if (!cachedTime || !cachedData) {
      return null;
    }
    
    // Check if cache is still valid (not expired)
    const cacheAgeMs = Date.now() - parseInt(cachedTime, 10);
    if (cacheAgeMs > CACHE_DURATION_MS) {
      return null; // Cache expired
    }
    
    const products = JSON.parse(cachedData);
    return Array.isArray(products) ? products : null;
  } catch (err) {
    console.warn('Failed to load cached products:', err);
    return null;
  }
}

/**
 * Save products to localStorage cache for instant future loads
 * @param {Array} products - Products array to cache
 */
function cacheProducts(products) {
  try {
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products));
    localStorage.setItem(PRODUCTS_CACHE_TIME_KEY, Date.now().toString());
  } catch (err) {
    // Storage quota exceeded or other error - silently fail
    console.warn('Failed to cache products:', err);
  }
}

// Load products dynamically from backend with pagination
// Uses localStorage cache for instant initial display, then updates with fresh data
async function loadProducts(page = 1, append = false) {
  if (isLoading) return;
  
  try {
    isLoading = true;
    
    // Step 1: Show cached products immediately for instant page load
    // This provides a near-instant experience while fresh data loads
    if (!append) {
      const cachedProducts = getCachedProducts();
      if (cachedProducts && cachedProducts.length > 0) {
        allProducts = cachedProducts;
        renderProducts();
        // Don't show loading spinner since we have cached content
      } else {
        // No cache available - show loading spinner
        showInlineLoading('decor-products');
        showInlineLoading('food-products');
      }
    }
    
    // Step 2: Fetch fresh data from the server
    // Note: Using limit=1000 to maintain current UX (load all products at once)
    // This can be changed to a lower limit (e.g., 20) when implementing
    // "load more" or infinite scroll functionality
    const res = await fetch(`${API_BASE}/api/products?page=${page}&limit=1000`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await res.json();
    
    // Handle both old format (array) and new format (object with products array)
    let freshProducts;
    if (Array.isArray(data)) {
      // Old format - backward compatibility
      freshProducts = data;
    } else {
      // New format with pagination
      freshProducts = data.products;
      
      if (data.pagination) {
        currentPage = data.pagination.page;
        totalPages = data.pagination.totalPages;
      }
    }
    
    // Step 3: Update products and cache
    if (append) {
      allProducts = [...allProducts, ...freshProducts];
    } else {
      allProducts = freshProducts;
    }
    
    // Cache the fresh products for next page load
    cacheProducts(allProducts);
    
    // Re-render with fresh data (may have updates from cache)
    renderProducts();
    
    // Initialize image zoom after products are loaded
    setTimeout(() => initImageZoom(), 100);
  } catch (err) {
    console.error('Error loading products:', err);
    // Only show error if we don't have cached products displayed
    if (allProducts.length === 0) {
      document.getElementById('decor-products').innerHTML = 
        '<div style="color:#ef4444;padding:1rem;">Failed to load products. Please try again later.</div>';
      document.getElementById('food-products').innerHTML = 
        '<div style="color:#ef4444;padding:1rem;">Failed to load products. Please try again later.</div>';
    }
    // If we have cached data, silently continue showing it
  } finally {
    isLoading = false;
  }
}

// Render products with current filters
function renderProducts() {
  const decor = allProducts.filter(p => p.type === 'decor');
  const food = allProducts.filter(p => p.type === 'food');
  
  // Group products
  const decorGrouped = groupProducts(decor);
  const foodGrouped = groupProducts(food);
  
  // Render decor products (grouped panels + ungrouped cards)
  let decorHtml = '';
  
  // Render grouped products as multi-product panels
  for (const [groupName, products] of Object.entries(decorGrouped.grouped)) {
    decorHtml += multiProductPanelToCard(groupName, products);
  }
  
  // Render ungrouped products as individual cards
  decorHtml += decorGrouped.ungrouped.map(productToCard).join('');
  
  document.getElementById('decor-products').innerHTML = decorHtml || 
    '<div style="color:#888;padding:1rem;">No products found.</div>';
  
  // Render food products (grouped panels + ungrouped cards)
  let foodHtml = '';
  
  // Render grouped products as multi-product panels
  for (const [groupName, products] of Object.entries(foodGrouped.grouped)) {
    foodHtml += multiProductPanelToCard(groupName, products);
  }
  
  // Render ungrouped products as individual cards
  foodHtml += foodGrouped.ungrouped.map(productToCard).join('');
  
  document.getElementById('food-products').innerHTML = foodHtml || 
    '<div style="color:#888;padding:1rem;">No products found.</div>';
  
  // Add fade-in animation to product cards
  setTimeout(() => {
    document.querySelectorAll('.product-card, .multi-product-panel').forEach((card, index) => {
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
  } else if (sortBy === 'name-reverse') {
    filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
  } else if (sortBy === 'stock-high') {
    filtered.sort((a, b) => (b.stock || 0) - (a.stock || 0));
  } else if (sortBy === 'stock-low') {
    filtered.sort((a, b) => (a.stock || 0) - (b.stock || 0));
  }
  
  const containerId = type === 'decor' ? 'decor-products' : 'food-products';
  
  // Group filtered products
  const filteredGrouped = groupProducts(filtered);
  
  // Render grouped products as multi-product panels
  let filteredHtml = '';
  for (const [groupName, products] of Object.entries(filteredGrouped.grouped)) {
    filteredHtml += multiProductPanelToCard(groupName, products);
  }
  
  // Render ungrouped products as individual cards
  filteredHtml += filteredGrouped.ungrouped.map(productToCard).join('');
  
  document.getElementById(containerId).innerHTML = filteredHtml || 
    '<div style="color:#888;padding:1rem;">No products found.</div>';
  
  // Add fade-in animation
  setTimeout(() => {
    document.querySelectorAll(`#${containerId} .product-card, #${containerId} .multi-product-panel`).forEach((card, index) => {
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
          class="more-details-btn"
          onclick="showProductDetails('${escapeAttr(p._id)}')"
          title="View detailed product information"
        >
          More Details
        </button>
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
 * Group products by their productGroup field
 * @param {Array} products - Array of products to group
 * @returns {Object} Object with grouped and ungrouped products
 */
function groupProducts(products) {
  const grouped = {};
  const ungrouped = [];
  
  products.forEach(product => {
    if (product.productGroup && product.productGroup.trim()) {
      const groupName = product.productGroup.trim();
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(product);
    } else {
      ungrouped.push(product);
    }
  });
  
  return { grouped, ungrouped };
}

/**
 * Render a multi-product panel for a group of products
 * @param {string} groupName - Name of the product group
 * @param {Array} products - Array of products in the group
 * @returns {string} HTML for the multi-product panel
 */
function multiProductPanelToCard(groupName, products) {
  if (!products || products.length === 0) return '';
  
  // Sort products by name for consistent display
  const sortedProducts = [...products].sort((a, b) => 
    (a.name || '').localeCompare(b.name || '')
  );
  
  const firstProduct = sortedProducts[0];
  const panelId = `panel-${escapeAttr(groupName.replace(/\s+/g, '-').toLowerCase())}`;
  const dropdownId = `dropdown-${escapeAttr(groupName.replace(/\s+/g, '-').toLowerCase())}`;
  
  // Create dropdown options
  const dropdownOptions = sortedProducts.map((p, idx) => {
    const productName = escapeHtml(p.name);
    const stock = p.stock !== undefined ? p.stock : 0;
    const stockText = stock === 0 ? ' (Out of Stock)' : stock <= 5 ? ` (${stock} left)` : '';
    return `<option value="${idx}" ${idx === 0 ? 'selected' : ''}>${productName}${stockText}</option>`;
  }).join('');
  
  // Generate initial product display
  const initialProductHtml = generateProductContent(firstProduct, 0, panelId, sortedProducts);
  
  return `
    <div class="multi-product-panel" id="${panelId}" data-group-name="${escapeAttr(groupName)}">
      <div class="multi-product-header">
        <h3 class="multi-product-group-title">${escapeHtml(groupName)}</h3>
        <div class="multi-product-selector">
          <label for="${dropdownId}">Select Product:</label>
          <select id="${dropdownId}" onchange="switchProduct('${escapeAttr(panelId)}', this.value)" class="product-dropdown">
            ${dropdownOptions}
          </select>
        </div>
      </div>
      <div class="multi-product-content" id="${panelId}-content">
        ${initialProductHtml}
      </div>
    </div>
  `;
}

/**
 * Generate product content HTML for a product within a multi-product panel
 * @param {Object} product - Product object
 * @param {number} index - Index of the product in the group
 * @param {string} panelId - ID of the parent panel
 * @param {Array} allGroupProducts - All products in the group (for storage)
 * @returns {string} HTML for the product content
 */
function generateProductContent(product, index, panelId, allGroupProducts = null) {
  // Store products data for switchProduct function
  if (allGroupProducts) {
    groupedProductsData[panelId] = allGroupProducts;
  }
  
  const stock = product.stock !== undefined ? product.stock : 0;
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
  const images = (product.images && product.images.length > 0) 
    ? product.images 
    : (product.image ? [product.image] : ['/img/default-product.png']);
  
  const productName = escapeHtml(product.name);
  const productDesc = escapeHtml(product.description || '');
  const productPrice = product.price && !isNaN(product.price) ? Number(product.price).toFixed(2) : 'N/A';
  
  // Escape options if present
  const optionsHtml = product.options && product.options.length 
    ? `<div style="font-size:0.9em;color:#666;margin-bottom:0.5em;"><strong>Options:</strong> ${product.options.map(escapeHtml).join(', ')}</div>` 
    : '';
  
  // Generate image carousel or single image
  let imageHtml;
  if (images.length > 1) {
    // Multi-image carousel
    const carouselId = `carousel-${escapeAttr(product._id)}`;
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
    <div class="product-card" id="product-${escapeAttr(product._id)}" data-product-index="${index}">
      <div class="product-top-section">
        ${imageHtml}
        <div class="product-info">
          <div class="product-title">${productName}</div>
          <div class="product-price">$${productPrice}</div>
          <div class="product-stock ${stockClass}">${stockText}</div>
          <div id="product-rating-${escapeAttr(product._id)}"></div>
          ${optionsHtml}
        </div>
      </div>
      <div class="product-bottom-section">
        <div class="product-desc">${productDesc}</div>
        <button 
          class="more-details-btn"
          onclick="showProductDetails('${escapeAttr(product._id)}')"
          title="View detailed product information"
        >
          More Details
        </button>
        <button 
          class="add-to-cart"
          data-id="${escapeAttr(product._id)}"
          ${isOutOfStock ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}
        >
          ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
        <button 
          class="view-reviews-btn"
          style="margin-top:0.5rem;background:linear-gradient(135deg,#52b788 0%,#40916c 100%);color:#fff;border:none;border-radius:8px;padding:0.4em 1em;font-weight:600;font-size:0.85em;cursor:pointer;width:100%;"
          onclick="toggleReviews('${escapeAttr(product._id)}')"
        >
          View Reviews
        </button>
        ${isAdmin ? `<button 
          class="edit-product-btn"
          data-id="${escapeAttr(product._id)}"
          onclick="openEditProductModal('${escapeAttr(product._id)}')"
        >
          Edit Product
        </button>` : ''}
        <div id="reviews-container-${escapeAttr(product._id)}" style="display:none;"></div>
      </div>
    </div>
  `;
}

/**
 * Switch to a different product within a multi-product panel
 * @param {string} panelId - ID of the panel
 * @param {string} productIndex - Index of the product to switch to
 */
function switchProduct(panelId, productIndex) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  
  const contentDiv = document.getElementById(`${panelId}-content`);
  if (!contentDiv) return;
  
  // Get products from stored data
  const products = groupedProductsData[panelId];
  if (!products || !products[productIndex]) return;
  
  const selectedProduct = products[productIndex];
  
  // Generate new content
  const newContent = generateProductContent(selectedProduct, productIndex, panelId);
  
  // Add fade transition
  contentDiv.style.opacity = '0';
  setTimeout(() => {
    contentDiv.innerHTML = newContent;
    contentDiv.style.opacity = '1';
    
    // Re-initialize carousels and zoom for new content
    initCarousels();
    initImageZoom();
    
    // Load ratings for the new product
    if (window.fetchReviewStats) {
      loadProductRatings();
    }
  }, 200);
}

// Store grouped products data for switchProduct function
let groupedProductsData = {};

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
document.addEventListener('DOMContentLoaded', () => loadProducts());

// Function to toggle reviews display
async function toggleReviews(productId) {
  const container = document.getElementById(`reviews-container-${productId}`);
  // Fix: Query for the specific View Reviews button instead of using previousElementSibling
  // to avoid incorrectly targeting the Edit Product button when it exists
  const productCard = document.getElementById(`product-${productId}`);
  const button = productCard ? productCard.querySelector('.view-reviews-btn') : null;
  
  if (!button) {
    console.error('View Reviews button not found for product:', productId);
    return;
  }
  
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

// Function to load rating stars for all products using bulk API for better performance
// Uses single API call instead of N individual requests
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
  
  if (productIds.length === 0) {
    return;
  }
  
  try {
    // Use bulk API endpoint for all product ratings in a single request
    // This is much faster than individual requests for each product
    const bulkStats = await window.fetchBulkReviewStats(productIds);
    
    // Update each product's rating display
    for (const productId of productIds) {
      const ratingContainer = document.getElementById(`product-rating-${productId}`);
      if (!ratingContainer) continue;
      
      const stats = bulkStats[productId];
      if (stats && stats.totalReviews > 0) {
        ratingContainer.innerHTML = `
          <div class="product-rating">
            <span class="stars">${window.renderStars(stats.averageRating)}</span>
            <span class="rating-count">${stats.averageRating.toFixed(1)} (${stats.totalReviews})</span>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Error loading bulk product ratings:', error);
    // Fallback to individual requests if bulk fails (graceful degradation)
    await loadProductRatingsFallback(productIds);
  }
}

// Fallback function for loading ratings one-by-one if bulk API fails
// Uses batching to prevent overwhelming the API
async function loadProductRatingsFallback(productIds) {
  const MAX_PARALLEL_REQUESTS = 6;
  const BATCH_DELAY_MS = 200;
  
  for (let i = 0; i < productIds.length; i += MAX_PARALLEL_REQUESTS) {
    const chunk = productIds.slice(i, i + MAX_PARALLEL_REQUESTS);
    
    await Promise.all(
      chunk.map(async (productId) => {
        const ratingContainer = document.getElementById(`product-rating-${productId}`);
        if (!ratingContainer) return;
        
        try {
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
    
    if (i + MAX_PARALLEL_REQUESTS < productIds.length) {
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
  document.getElementById('editProductGroup').value = product.productGroup || '';
  
  // Populate extended details if they exist
  const details = product.extendedDetails || {};
  const ingredientsField = document.getElementById('editProductIngredients');
  const allergensField = document.getElementById('editProductAllergens');
  const nutritionalInfoField = document.getElementById('editProductNutritionalInfo');
  const recipeField = document.getElementById('editProductRecipe');
  const careInstructionsField = document.getElementById('editProductCareInstructions');
  const dimensionsField = document.getElementById('editProductDimensions');
  const materialsField = document.getElementById('editProductMaterials');
  const weightField = document.getElementById('editProductWeight');
  const storageInstructionsField = document.getElementById('editProductStorageInstructions');
  const expirationInfoField = document.getElementById('editProductExpirationInfo');
  const additionalNotesField = document.getElementById('editProductAdditionalNotes');
  
  if (ingredientsField) ingredientsField.value = details.ingredients || '';
  if (allergensField) allergensField.value = details.allergens || '';
  if (nutritionalInfoField) nutritionalInfoField.value = details.nutritionalInfo || '';
  if (recipeField) recipeField.value = details.recipe || '';
  if (careInstructionsField) careInstructionsField.value = details.careInstructions || '';
  if (dimensionsField) dimensionsField.value = details.dimensions || '';
  if (materialsField) materialsField.value = details.materials || '';
  if (weightField) weightField.value = details.weight || '';
  if (storageInstructionsField) storageInstructionsField.value = details.storageInstructions || '';
  if (expirationInfoField) expirationInfoField.value = details.expirationInfo || '';
  if (additionalNotesField) additionalNotesField.value = details.additionalNotes || '';
  
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
      options: parseOptionsFromInput(document.getElementById('editProductOptions').value),
      productGroup: document.getElementById('editProductGroup')?.value || '',
      extendedDetails: {
        ingredients: document.getElementById('editProductIngredients')?.value || '',
        allergens: document.getElementById('editProductAllergens')?.value || '',
        nutritionalInfo: document.getElementById('editProductNutritionalInfo')?.value || '',
        recipe: document.getElementById('editProductRecipe')?.value || '',
        careInstructions: document.getElementById('editProductCareInstructions')?.value || '',
        dimensions: document.getElementById('editProductDimensions')?.value || '',
        materials: document.getElementById('editProductMaterials')?.value || '',
        weight: document.getElementById('editProductWeight')?.value || '',
        storageInstructions: document.getElementById('editProductStorageInstructions')?.value || '',
        expirationInfo: document.getElementById('editProductExpirationInfo')?.value || '',
        additionalNotes: document.getElementById('editProductAdditionalNotes')?.value || ''
      }
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
        const progressMsg = `Uploading image ${i + 1} of ${totalFiles}...`;
        if (submitBtn) {
          submitBtn.textContent = progressMsg;
        }
        if (progressDiv) {
          progressDiv.textContent = progressMsg;
        }
        
        try {
          const imageUrl = await uploadImageToFirebase(file);
          imageUrls.push(imageUrl);
        } catch (uploadErr) {
          console.error(`Failed to upload image ${i + 1}:`, uploadErr);
          const errorMsg = `Warning: Failed to upload image ${i + 1} (${uploadErr.message}). Continuing...`;
          if (progressDiv) {
            progressDiv.textContent = errorMsg;
          }
          // Continue with other images
          await new Promise(resolve => setTimeout(resolve, 1500)); // Brief pause to show error
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
window.showProductDetails = showProductDetails;
window.toggleDetailSection = toggleDetailSection;
window.switchProduct = switchProduct;

// Threshold for automatic collapsible sections (in characters)
const COLLAPSIBLE_THRESHOLD = 300;

// Helper function to create a collapsible detail section
function createCollapsibleSection(id, title, content, collapsed = false) {
  const contentLength = content.length;
  const shouldCollapse = contentLength > COLLAPSIBLE_THRESHOLD;
  
  // Sanitize id to prevent XSS
  const safeId = escapeAttr(id);
  
  if (shouldCollapse) {
    return `
      <div class="detail-section collapsible-section ${collapsed ? 'collapsed' : ''}">
        <h4 class="collapsible-header" onclick="toggleDetailSection('${safeId}')">
          <span class="collapse-arrow">${collapsed ? '▸' : '▾'}</span>
          ${title}
        </h4>
        <div class="collapsible-content ${collapsed ? 'hidden' : ''}" id="${safeId}">
          <p class="preserve-whitespace">${content}</p>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="detail-section">
        <h4>${title}</h4>
        <p class="preserve-whitespace">${content}</p>
      </div>
    `;
  }
}

// Function to toggle collapsible sections
function toggleDetailSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) {
    console.error('Section not found:', sectionId);
    return;
  }
  
  const header = section.previousElementSibling;
  if (!header) {
    console.error('Header not found for section:', sectionId);
    return;
  }
  
  const arrow = header.querySelector('.collapse-arrow');
  if (!arrow) {
    console.error('Arrow not found in header for section:', sectionId);
    return;
  }
  
  // Toggle visibility using CSS class
  const isHidden = section.classList.contains('hidden');
  if (isHidden) {
    section.classList.remove('hidden');
    arrow.textContent = '▾';
    header.parentElement.classList.remove('collapsed');
  } else {
    section.classList.add('hidden');
    arrow.textContent = '▸';
    header.parentElement.classList.add('collapsed');
  }
}

// Function to display product details in a modal
function showProductDetails(productId) {
  const product = allProducts.find(p => p._id === productId);
  if (!product) {
    console.error('Product not found:', productId);
    return;
  }
  
  const productName = escapeHtml(product.name);
  const details = product.extendedDetails || {};
  
  // Build the details HTML
  let detailsHtml = `<div class="product-details-content">`;
  detailsHtml += `<h3><span class="info-icon-large">ℹ️</span> ${productName} - Product Details</h3>`;
  
  // Always show basic product information
  if (product.description) {
    detailsHtml += createCollapsibleSection(
      `desc-${productId}`,
      'Description',
      escapeHtml(product.description),
      false
    );
  }
  
  if (product.price !== undefined && product.price !== null) {
    detailsHtml += `
      <div class="detail-section">
        <h4>Price</h4>
        <p>$${Number(product.price).toFixed(2)}</p>
      </div>
    `;
  }
  
  if (product.stock !== undefined && product.stock !== null) {
    const stockStatus = product.stock === 0 ? 'Out of Stock' : 
                       product.stock <= 5 ? `Low Stock: ${product.stock} available` : 
                       `${product.stock} available`;
    detailsHtml += `
      <div class="detail-section">
        <h4>Availability</h4>
        <p>${stockStatus}</p>
      </div>
    `;
  }
  
  if (product.options && product.options.length > 0) {
    detailsHtml += `
      <div class="detail-section">
        <h4>Available Options</h4>
        <p>${product.options.map(escapeHtml).join(', ')}</p>
      </div>
    `;
  }
  
  if (product.type) {
    const typeLabel = product.type === 'decor' ? 'Handmade Crafts' : 
                     product.type === 'food' ? 'Cottage Foods' : product.type;
    detailsHtml += `
      <div class="detail-section">
        <h4>Product Type</h4>
        <p>${escapeHtml(typeLabel)}</p>
      </div>
    `;
  }
  
  // Show all extended details fields (always visible, with N/A or None for empty fields)
  // Use "None" for textarea fields and "N/A" for text input fields
  
  // Ingredients (textarea field - show "None" if empty)
  detailsHtml += createCollapsibleSection(
    `ingredients-${productId}`,
    'Ingredients',
    escapeHtml(details.ingredients || 'None'),
    false
  );
  
  // Allergen Information (text field - show "N/A" if empty)
  detailsHtml += `
    <div class="detail-section allergen-section">
      <h4>Allergen Information</h4>
      <p>${escapeHtml(details.allergens || 'N/A')}</p>
    </div>
  `;
  
  // Nutritional Information (textarea field - show "None" if empty)
  detailsHtml += createCollapsibleSection(
    `nutritional-${productId}`,
    'Nutritional Information',
    escapeHtml(details.nutritionalInfo || 'None'),
    true
  );
  
  // Materials (text field - show "N/A" if empty)
  detailsHtml += `
    <div class="detail-section">
      <h4>Materials</h4>
      <p>${escapeHtml(details.materials || 'N/A')}</p>
    </div>
  `;
  
  // Dimensions (text field - show "N/A" if empty)
  detailsHtml += `
    <div class="detail-section">
      <h4>Dimensions</h4>
      <p>${escapeHtml(details.dimensions || 'N/A')}</p>
    </div>
  `;
  
  // Weight (text field - show "N/A" if empty)
  detailsHtml += `
    <div class="detail-section">
      <h4>Weight</h4>
      <p>${escapeHtml(details.weight || 'N/A')}</p>
    </div>
  `;
  
  // Care Instructions (textarea field - show "None" if empty)
  detailsHtml += createCollapsibleSection(
    `care-${productId}`,
    'Care Instructions',
    escapeHtml(details.careInstructions || 'None'),
    true
  );
  
  // Recipe / Usage Instructions (textarea field - show "None" if empty)
  detailsHtml += createCollapsibleSection(
    `recipe-${productId}`,
    'Recipe / Usage Instructions',
    escapeHtml(details.recipe || 'None'),
    true
  );
  
  // Storage Instructions (textarea field - show "None" if empty)
  detailsHtml += createCollapsibleSection(
    `storage-${productId}`,
    'Storage Instructions',
    escapeHtml(details.storageInstructions || 'None'),
    false
  );
  
  // Expiration / Shelf Life (text field - show "N/A" if empty)
  detailsHtml += `
    <div class="detail-section">
      <h4>Expiration / Shelf Life</h4>
      <p>${escapeHtml(details.expirationInfo || 'N/A')}</p>
    </div>
  `;
  
  // Additional Notes (textarea field - show "None" if empty)
  detailsHtml += createCollapsibleSection(
    `notes-${productId}`,
    'Additional Notes',
    escapeHtml(details.additionalNotes || 'None'),
    true
  );
  
  detailsHtml += `</div>`;
  
  // Create or update modal
  let modal = document.getElementById('productDetailsModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'productDetailsModal';
    modal.className = 'product-details-modal';
    modal.innerHTML = `
      <div class="product-details-modal-content">
        <button class="product-details-close" onclick="closeProductDetailsModal()">&times;</button>
        <div id="productDetailsBody"></div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeProductDetailsModal();
      }
    });
  }
  
  document.getElementById('productDetailsBody').innerHTML = detailsHtml;
  modal.style.display = 'flex';
}

function closeProductDetailsModal() {
  const modal = document.getElementById('productDetailsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Expose close function to global scope
window.closeProductDetailsModal = closeProductDetailsModal;
