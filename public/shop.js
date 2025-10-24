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
  
  return `
    <div class="product-card">
      <img src="${p.image}" alt="${p.name}" class="product-img"/>
      <div class="product-title">${p.name}</div>
      <div class="product-price">$${p.price && !isNaN(p.price) ? Number(p.price).toFixed(2) : 'N/A'}</div>
      <div class="product-stock ${stockClass}">${stockText}</div>
      ${p.options && p.options.length ? `<div style="font-size:0.9em;color:#666;margin-bottom:0.5em;"><strong>Options:</strong> ${p.options.join(', ')}</div>` : ''}
      <div class="product-desc">${p.description || ''}</div>
      <button 
        onclick='addToCart(${JSON.stringify({name: p.name, price: p.price, id: p._id, image: p.image})})' 
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
