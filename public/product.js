// API base URL (consistent with shop.js and reviews.js)
const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://bonnie-lass-florals.onrender.com';
const SITE_BASE_URL = 'https://bonnielassflorals.com';
const RELATED_PRODUCTS_PAGE_SIZE = 40;
const MAX_RELATED_PRODUCT_PAGES = 5;

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

// Generate responsive image HTML (mirrors shop.js)
function generateResponsiveImage(imageUrl, altText, extraClass) {
  const cls = `product-img product-detail-img${extraClass ? ' ' + extraClass : ''}`;
  const isWebP = imageUrl.toLowerCase().includes('.webp');

  if (isWebP) {
    const baseUrl = imageUrl.replace(/\.webp$/i, '');
    const jpegUrl = baseUrl + '.jpg';
    return `
      <picture>
        <source srcset="${imageUrl}" type="image/webp">
        <img src="${jpegUrl}" alt="${altText}" class="${cls}" loading="eager" width="480" height="420" decoding="async" />
      </picture>
    `;
  }

  return `<img src="${imageUrl}" alt="${altText}" class="${cls}" loading="eager" width="480" height="420" decoding="async" />`;
}

// Carousel navigation – mirrors shop.js implementations
function nextImage(carouselId) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  const images = carousel.querySelectorAll('.product-img');
  const indicators = carousel.querySelectorAll('.indicator');
  let currentIndex = -1;
  images.forEach((img, idx) => {
    if (img.style.display !== 'none') currentIndex = idx;
  });
  if (currentIndex === -1) currentIndex = 0;
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
  images.forEach((img, idx) => {
    if (img.style.display !== 'none') currentIndex = idx;
  });
  if (currentIndex === -1) currentIndex = 0;
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
  images.forEach((img, idx) => {
    img.style.display = idx === targetIndex ? 'block' : 'none';
    if (indicators[idx]) {
      indicators[idx].classList.toggle('active', idx === targetIndex);
    }
  });
}

// Show "not found" state
function showNotFound() {
  document.getElementById('product-loading').style.display = 'none';
  document.getElementById('product-not-found').style.display = 'block';
  document.title = 'Product Not Found - Bonnie Lass Florals';
}

function upsertMetaTag(attr, value, content) {
  if (!value || !content) return;
  let tag = document.querySelector(`meta[${attr}="${value}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, value);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonicalUrl(url) {
  if (!url) return;
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setProductStructuredData(product, productUrl, imageUrl) {
  let schema = document.getElementById('product-schema');
  if (!schema) {
    schema = document.createElement('script');
    schema.id = 'product-schema';
    schema.type = 'application/ld+json';
    document.head.appendChild(schema);
  }

  const normalizedPrice = product.price != null && !isNaN(product.price)
    ? Number(product.price).toFixed(2)
    : undefined;
  const numericStock = Number(product.stock);
  const stock = Number.isFinite(numericStock) ? numericStock : 0;
  const description = typeof product.description === 'string'
    ? product.description.slice(0, 400)
    : '';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name || 'Product',
    description,
    image: imageUrl ? [imageUrl] : undefined,
    sku: product._id || undefined,
    url: productUrl,
    brand: {
      '@type': 'Brand',
      name: 'Bonnie Lass Florals'
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'USD',
      price: normalizedPrice,
      availability: stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock'
    }
  };

  schema.textContent = JSON.stringify(data);
}

// Fetch and render the product
async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    showNotFound();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(productId)}`);
    if (!res.ok) {
      showNotFound();
      return;
    }
    const product = await res.json();
    renderProduct(product);
  } catch (err) {
    console.error('Error loading product:', err);
    showNotFound();
  }
}

// Render all product details into the page
function renderProduct(product) {
  document.getElementById('product-loading').style.display = 'none';
  document.getElementById('product-detail').style.display = 'block';

  const productName = product.name || 'Product';
  const productId = product._id ? String(product._id) : '';
  const productUrl = `${SITE_BASE_URL}/product.html?id=${encodeURIComponent(productId)}`;

  // Update page title and breadcrumb
  document.title = `${productName} - Bonnie Lass Florals`;
  document.getElementById('product-breadcrumb-name').textContent = productName;

  // Point the "Back to Shop" breadcrumb link to the correct tab
  const typeHash = product.type === 'food' ? '#food' : '#decor';
  document.getElementById('breadcrumb-shop-link').href = `shop.html${typeHash}`;
  document.getElementById('back-to-shop-link').href = `shop.html${typeHash}`;

  // Update meta description for SEO
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && product.description) {
    metaDesc.setAttribute('content', product.description.substring(0, 160));
  }

  // ---- Images ----
  const images = (product.images && product.images.length > 0)
    ? product.images
    : (product.image ? [product.image] : ['/img/default-product.png']);
  const primaryImage = images[0] || '/img/default-product.png';
  const absolutePrimaryImage = /^https?:\/\//i.test(primaryImage)
    ? primaryImage
    : `${SITE_BASE_URL}${primaryImage.startsWith('/') ? '' : '/'}${primaryImage}`;

  setCanonicalUrl(productUrl);
  upsertMetaTag('property', 'og:title', `${productName} - Bonnie Lass Florals`);
  upsertMetaTag('property', 'og:description', product.description || 'Shop handmade products from Bonnie Lass Florals.');
  upsertMetaTag('property', 'og:type', 'product');
  upsertMetaTag('property', 'og:url', productUrl);
  upsertMetaTag('property', 'og:image', absolutePrimaryImage);
  upsertMetaTag('name', 'twitter:title', `${productName} - Bonnie Lass Florals`);
  upsertMetaTag('name', 'twitter:description', product.description || 'Shop handmade products from Bonnie Lass Florals.');
  upsertMetaTag('name', 'twitter:image', absolutePrimaryImage);
  setProductStructuredData(product, productUrl, absolutePrimaryImage);

  const imagesContainer = document.getElementById('product-detail-images');
  const productNameEscaped = escapeAttr(productName);

  if (images.length > 1) {
    const carouselId = 'product-detail-carousel';
    const carouselImages = images.map((img, idx) => {
      const imageUrl = img && img.trim() ? escapeAttr(img) : '/img/default-product.png';
      return `<img
        src="${imageUrl}"
        alt="${productNameEscaped} - Image ${idx + 1}"
        class="product-img product-detail-img"
        loading="${idx === 0 ? 'eager' : 'lazy'}"
        width="480" height="420" decoding="async"
        style="display:${idx === 0 ? 'block' : 'none'};"
      >`;
    }).join('');

    const indicators = images.map((_, idx) =>
      `<span class="indicator ${idx === 0 ? 'active' : ''}" onclick="goToImage('${carouselId}', ${idx})"></span>`
    ).join('');

    imagesContainer.innerHTML = `
      <div class="product-image-carousel" id="${carouselId}">
        ${carouselImages}
        <button class="carousel-prev" onclick="prevImage('${carouselId}')">‹</button>
        <button class="carousel-next" onclick="nextImage('${carouselId}')">›</button>
        <div class="carousel-indicators">${indicators}</div>
      </div>
    `;
  } else {
    const imageUrl = images[0] && images[0].trim() ? escapeAttr(images[0]) : '/img/default-product.png';
    imagesContainer.innerHTML = generateResponsiveImage(imageUrl, productNameEscaped);
  }

  // ---- Name ----
  document.getElementById('product-detail-name').textContent = productName;

  // ---- Price ----
  const price = product.price != null && !isNaN(product.price) ? Number(product.price).toFixed(2) : null;
  document.getElementById('product-detail-price').textContent = price ? `$${price}` : '';

  // ---- Stock ----
  const stock = product.stock !== undefined ? product.stock : 0;
  const stockEl = document.getElementById('product-detail-stock');
  if (stock === 0) {
    stockEl.textContent = 'Out of Stock';
    stockEl.className = 'product-stock out-of-stock';
  } else if (stock <= 5) {
    stockEl.textContent = `Low Stock: ${stock} left`;
    stockEl.className = 'product-stock low-stock';
  } else {
    stockEl.textContent = `In Stock (${stock} available)`;
    stockEl.className = 'product-stock';
  }

  // ---- Options dropdown ----
  const optionsContainer = document.getElementById('product-detail-options');
  if (product.options && product.options.length > 0) {
    const optionItems = product.options
      .map(opt => `<option value="${escapeAttr(opt)}">${escapeHtml(opt)}</option>`)
      .join('');
    optionsContainer.innerHTML = `
      <div class="product-option-selector" style="margin-bottom:0.5rem;">
        <label for="product-option-select" style="font-size:0.95em;font-weight:600;color:#1b4332;display:block;margin-bottom:0.4em;">Choose Option:</label>
        <select id="product-option-select" style="width:100%;max-width:300px;padding:0.5em 0.8em;border:1px solid #c8e6d9;border-radius:8px;font-size:1em;color:#1b4332;background:#f1faee;cursor:pointer;">
          <option value="">-- Select an option --</option>
          ${optionItems}
        </select>
      </div>
    `;
  }

  // ---- Description ----
  if (product.description) {
    document.getElementById('product-detail-description').innerHTML =
      `<p class="product-detail-desc">${escapeHtml(product.description)}</p>`;
  }

  // ---- Add to Cart button ----
  const addBtn = document.getElementById('product-detail-add-to-cart');
  if (stock === 0) {
    addBtn.textContent = 'Out of Stock';
    addBtn.disabled = true;
  } else {
    addBtn.textContent = 'Add to Cart';
    addBtn.onclick = () => handleAddToCart(product);
  }

  // ---- Extended details accordion ----
  renderExtendedDetails(product);
  setupProductShare(product, productUrl, absolutePrimaryImage);
  loadRelatedProducts(product);

  // ---- Rating stars (async) ----
  if (window.fetchReviewStats) {
    window.fetchReviewStats(product._id).then(stats => {
      if (stats && stats.totalReviews > 0) {
        document.getElementById('product-detail-rating').innerHTML = `
          <div class="product-rating">
            <span class="stars">${window.renderStars(stats.averageRating)}</span>
            <span class="rating-count">${stats.averageRating.toFixed(1)} (${stats.totalReviews} ${stats.totalReviews === 1 ? 'review' : 'reviews'})</span>
          </div>
        `;
      }
    }).catch(() => {});
  }

  // ---- Reviews section (async) ----
  if (window.initProductReviews) {
    window.initProductReviews(product._id).then(reviewData => {
      const reviewsSection = document.getElementById('product-detail-reviews-section');
      document.getElementById('product-detail-reviews').innerHTML = reviewData.html;
      reviewsSection.style.display = 'block';
    }).catch(err => {
      console.error('Error loading reviews:', err);
    });
  }
}

function setupProductShare(product, productUrl, imageUrl) {
  const shareSection = document.getElementById('product-share-section');
  const copyBtn = document.getElementById('share-copy-link');
  const facebookBtn = document.getElementById('share-facebook');
  const pinterestBtn = document.getElementById('share-pinterest');
  if (!shareSection || !copyBtn || !facebookBtn || !pinterestBtn) return;

  shareSection.style.display = 'flex';

  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      if (typeof showNotification === 'function') {
        showNotification('Product link copied to clipboard!', 'success', 2500);
      }
    } catch {
      window.prompt('Copy this product link:', productUrl);
    }
  };

  facebookBtn.onclick = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  pinterestBtn.onclick = () => {
    const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(product.name || 'Bonnie Lass Florals product')}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=800,height=600');
  };
}

async function loadRelatedProducts(product) {
  const section = document.getElementById('related-products-section');
  const grid = document.getElementById('related-products-grid');
  if (!section || !grid || !product || !product._id || !product.type) return;

  try {
    const related = [];
    let page = 1;
    let hasMorePages = true;

    while (related.length < 4 && hasMorePages && page <= MAX_RELATED_PRODUCT_PAGES) {
      const res = await fetch(
        `${API_BASE}/api/products?page=${page}&limit=${RELATED_PRODUCTS_PAGE_SIZE}&type=${encodeURIComponent(product.type)}`
      );
      if (!res.ok) break;

      const data = await res.json();
      const products = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);

      if (products.length === 0) break;

      const matches = products.filter(p =>
        p &&
        p._id &&
        p._id !== product._id &&
        typeof p.type === 'string' &&
        p.type === product.type &&
        (p.stock || 0) > 0
      );

      related.push(...matches);

      if (Array.isArray(data?.products) && data?.pagination) {
        hasMorePages = data.pagination.page < data.pagination.totalPages;
      } else {
        hasMorePages = products.length === RELATED_PRODUCTS_PAGE_SIZE;
      }

      page += 1;
    }

    if (related.length === 0) {
      section.style.display = 'none';
      return;
    }

    const cards = related.slice(0, 4).map(p => {
      const id = escapeAttr(p._id);
      const name = escapeHtml(p.name || 'Product');
      const rawImage = (p.images && p.images[0]) || p.image || '/img/default-product.png';
      const image = escapeAttr(rawImage);
      const price = p.price != null && !isNaN(p.price) ? `$${Number(p.price).toFixed(2)}` : '';
      return `
        <article class="related-product-card">
          <a href="product.html?id=${id}" aria-label="View ${name}">
            <img src="${image}" alt="${name}" width="220" height="180" loading="lazy" decoding="async" style="width:100%;height:180px;object-fit:cover;border-radius:10px;background:#f8f9fa;">
          </a>
          <a href="product.html?id=${id}">${name}</a>
          <div class="related-product-price">${escapeHtml(price)}</div>
        </article>
      `;
    }).join('');

    grid.innerHTML = cards;
    section.style.display = 'block';
  } catch (err) {
    console.error('Failed to load related products:', err);
  }
}

// Handle add-to-cart from the product detail page
function handleAddToCart(product) {
  let selectedOption = '';

  if (product.options && product.options.length > 0) {
    const optionSelect = document.getElementById('product-option-select');
    selectedOption = optionSelect ? optionSelect.value : '';
    if (!selectedOption) {
      if (typeof showNotification === 'function') {
        showNotification('Please choose an option before adding to cart.', 'error', 3000);
      }
      if (optionSelect) {
        optionSelect.style.border = '2px solid #ef4444';
        setTimeout(() => { optionSelect.style.border = '1px solid #c8e6d9'; }, 2000);
      }
      return;
    }
  }

  if (typeof addToCart === 'function') {
    addToCart({
      name: product.name,
      price: product.price,
      id: product._id,
      image: (product.images && product.images[0]) || product.image || '',
      selectedOption: selectedOption || undefined
    });
  }
}

// Render extended details as a collapsible accordion (only for fields that have data)
function renderExtendedDetails(product) {
  const details = product.extendedDetails || {};
  const container = document.getElementById('product-detail-extended');

  const sections = [
    { label: 'Ingredients',                  value: details.ingredients },
    { label: 'Allergen Information',          value: details.allergens },
    { label: 'Nutritional Information',       value: details.nutritionalInfo },
    { label: 'Dimensions',                    value: details.dimensions },
    { label: 'Materials',                     value: details.materials },
    { label: 'Weight',                        value: details.weight },
    { label: 'Care Instructions',             value: details.careInstructions },
    { label: 'Recipe / Usage Instructions',   value: details.recipe },
    { label: 'Storage Instructions',          value: details.storageInstructions },
    { label: 'Shelf Life / Expiration',       value: details.expirationInfo },
    { label: 'Additional Notes',              value: details.additionalNotes },
  ].filter(s => s.value && s.value.trim());

  if (sections.length === 0) {
    container.innerHTML = '';
    return;
  }

  const items = sections.map(s => `
    <details class="extended-detail-item">
      <summary>${escapeHtml(s.label)}</summary>
      <div class="extended-detail-body">${escapeHtml(s.value)}</div>
    </details>
  `).join('');

  container.innerHTML = `
    <div class="product-extended-details">
      <h2>Product Details</h2>
      ${items}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', loadProduct);

// Expose carousel functions to global scope for onclick handlers in generated HTML
window.nextImage = nextImage;
window.prevImage = prevImage;
window.goToImage = goToImage;
