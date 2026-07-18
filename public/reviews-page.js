const REVIEWS_API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://bonnie-lass-florals.onrender.com';

let reviewsHubProducts = [];
const reviewsHubProductsById = new Map();

function escapeHtmlSafe(value) {
  if (!value) return '';
  return value
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setHubStatus(message) {
  const statusEl = document.getElementById('reviews-hub-status');
  if (statusEl) statusEl.textContent = message || '';
}

function parseRequestedProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('productId') || '';
}

function updateProductIdInUrl(productId) {
  const params = new URLSearchParams(window.location.search);
  if (productId) {
    params.set('productId', productId);
  } else {
    params.delete('productId');
  }
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}`;
  history.replaceState({}, '', nextUrl);
}

async function fetchProductsForReviewsHub() {
  const response = await fetch(`${REVIEWS_API_BASE}/api/products?page=1&limit=1000`);
  if (!response.ok) {
    throw new Error('Failed to load products');
  }

  const data = await response.json();
  const products = Array.isArray(data) ? data : (data.products || []);

  return products.sort((a, b) => {
    const typeA = (a.type || '').toLowerCase();
    const typeB = (b.type || '').toLowerCase();
    if (typeA !== typeB) return typeA.localeCompare(typeB);
    return (a.name || '').localeCompare(b.name || '');
  });
}

function getFilteredProductsByType(typeFilter) {
  if (!typeFilter || typeFilter === 'all') return reviewsHubProducts;
  return reviewsHubProducts.filter(product => product.type === typeFilter);
}

function populateProductSelect(typeFilter, preferredProductId) {
  const selectEl = document.getElementById('review-product-select');
  if (!selectEl) return '';

  const filteredProducts = getFilteredProductsByType(typeFilter);
  selectEl.innerHTML = '';

  if (filteredProducts.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No products available';
    selectEl.appendChild(option);
    return '';
  }

  const preferredExists = filteredProducts.some(product => product._id === preferredProductId);
  const selectedProductId = preferredExists ? preferredProductId : filteredProducts[0]._id;

  filteredProducts.forEach(product => {
    const option = document.createElement('option');
    option.value = product._id;
    const typeLabel = product.type === 'food' ? 'Cottage Food' : 'Handmade Craft';
    option.textContent = `${product.name} (${typeLabel})`;
    selectEl.appendChild(option);
  });

  selectEl.value = selectedProductId;
  return selectedProductId;
}

async function renderSelectedProductReviews(productId) {
  const container = document.getElementById('reviews-hub-container');
  if (!container) return;

  if (!productId) {
    container.innerHTML = '';
    setHubStatus('Choose a product to read or leave feedback.');
    return;
  }

  const product = reviewsHubProductsById.get(productId);
  if (!product) {
    container.innerHTML = '';
    setHubStatus('Selected product is unavailable. Please choose another.');
    return;
  }

  setHubStatus('Loading customer feedback...');

  try {
    const reviewData = await window.initProductReviews(productId);
    const safeName = escapeHtmlSafe(product.name || 'Product');
    const safeType = product.type === 'food' ? 'Cottage Food' : 'Handmade Craft';

    container.innerHTML = `
      <div class="selected-product-summary">
        <h2>${safeName}</h2>
        <p>${safeType} · <a href="product.html?id=${encodeURIComponent(productId)}">View product details</a></p>
      </div>
      ${reviewData.html}
    `;

    setHubStatus('Read comments below or write your own review.');
  } catch (error) {
    console.error('Failed to render selected product reviews:', error);
    container.innerHTML = '<div class="review-error">Failed to load reviews for this product.</div>';
    setHubStatus('Could not load feedback right now. Please try again.');
  }
}

async function initReviewsHub() {
  const typeSelect = document.getElementById('review-type-select');
  const productSelect = document.getElementById('review-product-select');

  if (!typeSelect || !productSelect) return;

  try {
    reviewsHubProducts = await fetchProductsForReviewsHub();
    reviewsHubProductsById.clear();
    reviewsHubProducts.forEach(product => {
      if (product && product._id) reviewsHubProductsById.set(product._id, product);
    });

    const requestedProductId = parseRequestedProductId();
    const requestedProduct = reviewsHubProductsById.get(requestedProductId);

    if (requestedProduct && requestedProduct.type) {
      typeSelect.value = requestedProduct.type;
    }

    const selectedProductId = populateProductSelect(typeSelect.value, requestedProductId);
    updateProductIdInUrl(selectedProductId);
    await renderSelectedProductReviews(selectedProductId);
  } catch (error) {
    console.error('Failed to initialize reviews hub:', error);
    setHubStatus('Failed to load products. Please refresh and try again.');
    const container = document.getElementById('reviews-hub-container');
    if (container) {
      container.innerHTML = '<div class="review-error">Unable to load review options.</div>';
    }
    return;
  }

  typeSelect.addEventListener('change', async () => {
    const nextProductId = populateProductSelect(typeSelect.value, productSelect.value);
    updateProductIdInUrl(nextProductId);
    await renderSelectedProductReviews(nextProductId);
  });

  productSelect.addEventListener('change', async () => {
    updateProductIdInUrl(productSelect.value);
    await renderSelectedProductReviews(productSelect.value);
  });

  if (window.firebase && firebase.auth) {
    firebase.auth().onAuthStateChanged(async () => {
      const currentProductId = productSelect.value;
      if (currentProductId) {
        await renderSelectedProductReviews(currentProductId);
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReviewsHub);
} else {
  initReviewsHub();
}
