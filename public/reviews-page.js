const REVIEWS_API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://bonnie-lass-florals.onrender.com';

let reviewsHubProducts = [];
const reviewsHubProductsById = new Map();

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
  const products = [];
  const limit = 100;
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(`${REVIEWS_API_BASE}/api/products?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to load products');
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      products.push(...data);
      break;
    }

    products.push(...(data.products || []));
    totalPages = data.pagination?.totalPages || 1;
    page += 1;
  }

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
    const stats = await window.fetchReviewStats(productId);
    const safeType = product.type === 'food' ? 'Cottage Food' : 'Handmade Craft';
    const stars = typeof window.renderStars === 'function'
      ? window.renderStars(stats.averageRating || 0)
      : '';
    const ratingText = `${Number(stats.averageRating || 0).toFixed(1)} (${stats.totalReviews || 0} ${(stats.totalReviews || 0) === 1 ? 'review' : 'reviews'})`;

    container.textContent = '';

    const summary = document.createElement('div');
    summary.className = 'selected-product-summary';

    const title = document.createElement('h2');
    title.textContent = product.name || 'Product';
    summary.appendChild(title);

    const description = document.createElement('p');
    description.textContent = `${safeType} · `;
    const productLink = document.createElement('a');
    productLink.href = `product.html?id=${encodeURIComponent(productId)}`;
    productLink.textContent = 'View product details';
    description.appendChild(productLink);
    summary.appendChild(description);

    const ratingLine = document.createElement('p');
    ratingLine.textContent = `${stars} ${ratingText}`;
    summary.appendChild(ratingLine);

    const reviewsSection = document.createElement('div');
    reviewsSection.className = 'reviews-section';

    const reviewsHeader = document.createElement('div');
    reviewsHeader.className = 'reviews-header';

    const reviewsTitle = document.createElement('h3');
    reviewsTitle.textContent = 'Reviews';
    reviewsHeader.appendChild(reviewsTitle);

    const addReviewBtn = document.createElement('button');
    addReviewBtn.className = 'add-review-btn';
    addReviewBtn.type = 'button';
    addReviewBtn.textContent = 'Write Review';
    addReviewBtn.addEventListener('click', () => {
      if (typeof window.showReviewForm === 'function') {
        window.showReviewForm(productId);
      }
    });
    reviewsHeader.appendChild(addReviewBtn);

    const reviewsList = document.createElement('div');
    reviewsList.id = `reviews-list-${productId}`;

    reviewsSection.appendChild(reviewsHeader);
    reviewsSection.appendChild(reviewsList);

    container.appendChild(summary);
    container.appendChild(reviewsSection);

    if (typeof window.loadProductReviews === 'function') {
      await window.loadProductReviews(productId);
    }

    setHubStatus('Read comments below or write your own review.');
  } catch (error) {
    console.error('Failed to render selected product reviews:', error);
    container.textContent = '';
    const errorEl = document.createElement('div');
    errorEl.className = 'review-error';
    errorEl.textContent = 'Failed to load reviews for this product.';
    container.appendChild(errorEl);
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
      container.textContent = '';
      const errorEl = document.createElement('div');
      errorEl.className = 'review-error';
      errorEl.textContent = 'Unable to load review options.';
      container.appendChild(errorEl);
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
