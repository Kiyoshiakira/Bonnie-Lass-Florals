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

// Global products cache
let allProducts = [];

// Load products dynamically from backend
async function loadProducts() {
  try {
    showInlineLoading('decor-products');
    showInlineLoading('food-products');
    
    // Use your Render API URL
    const res = await fetch('https://bonnie-lass-florals.onrender.com/api/products');
    
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    
    allProducts = await res.json();
    renderProducts();
    
    // Initialize image zoom after products are loaded
    setTimeout(() => initImageZoom(), 100);
  } catch (err) {
    console.error('Error loading products:', err);
    document.getElementById('decor-products').innerHTML = 
      '<div style="color:#ef4444;padding:1rem;">Failed to load products. Please try again later.</div>';
    document.getElementById('food-products').innerHTML = 
      '<div style="color:#ef4444;padding:1rem;">Failed to load products. Please try again later.</div>';
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
  
  // Use default placeholder if image is missing or empty
  const imageUrl = p.image && p.image.trim() ? escapeAttr(p.image) : '/img/default-product.png';
  const productName = escapeHtml(p.name);
  const productDesc = escapeHtml(p.description || '');
  const productPrice = p.price && !isNaN(p.price) ? Number(p.price).toFixed(2) : 'N/A';
  
  // Escape options if present
  const optionsHtml = p.options && p.options.length 
    ? `<div style="font-size:0.9em;color:#666;margin-bottom:0.5em;"><strong>Options:</strong> ${p.options.map(escapeHtml).join(', ')}</div>` 
    : '';
  
  return `
    <div class="product-card">
      <img src="${imageUrl}" alt="${productName}" class="product-img" loading="lazy" width="300" height="300"/>
      <div class="product-title">${productName}</div>
      <div class="product-price">$${productPrice}</div>
      <div class="product-stock ${stockClass}">${stockText}</div>
      ${optionsHtml}
      <div class="product-desc">${productDesc}</div>
      <button 
        class="add-to-cart"
        data-id="${escapeAttr(p._id)}"
        ${isOutOfStock ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}
      >
        ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  `;
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', loadProducts);

// Expose functions to global scope for HTML onclick
window.showShopSection = showShopSection;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
