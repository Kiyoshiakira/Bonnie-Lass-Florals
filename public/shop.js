// Handles tab switching between Decor and Cottage Foods
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

// Load products dynamically from backend
async function loadProducts() {
  try {
    // Use your Render API URL
    const res = await fetch('https://bonnie-lass-florals.onrender.com/api/products');
    const products = await res.json();
    const decor = products.filter(p => p.type === 'decor');
    const food = products.filter(p => p.type === 'food');
    document.getElementById('decor-products').innerHTML = decor.map(productToCard).join('');
    document.getElementById('food-products').innerHTML = food.map(productToCard).join('');
  } catch (err) {
    document.getElementById('decor-products').innerHTML = 
      '<div style="color:red">Failed to load products.</div>';
    document.getElementById('food-products').innerHTML = 
      '<div style="color:red">Failed to load products.</div>';
    console.error('Error loading products:', err);
  }
}

function productToCard(p) {
  return `
    <div class="product-card">
      <img src="${p.image}" alt="${p.name}" class="product-img"/>
      <div class="product-title">${p.name}</div>
      <div class="product-price">$${p.price && !isNaN(p.price) ? Number(p.price).toFixed(2) : ''}</div>
      <div class="product-stock">Stock: ${p.stock !== undefined ? p.stock : 'N/A'}</div>
      ${p.options && p.options.length ? `<div><strong>Options:</strong> ${p.options.join(', ')}</div>` : ''}
      <div class="product-desc">${p.description || ''}</div>
      <button onclick='addToCart(${JSON.stringify({name: p.name, price: p.price, id: p._id})})'>Add to Cart</button>
    </div>
  `;
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', loadProducts);

// Expose showShopSection to global scope for HTML onclick
window.showShopSection = showShopSection;
