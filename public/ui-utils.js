// UI Utilities for Bonnie Lass Florals

// Show notification
function showNotification(message, type = 'info', duration = 5000) {
  // Remove any existing notifications
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-message">${message}</div>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  document.body.appendChild(notification);

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, duration);
  }
}

// Show/hide loading overlay
function showLoading(message = 'Loading...') {
  let overlay = document.getElementById('loadingOverlay');
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p id="loadingMessage">${message}</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  
  const loadingMessage = document.getElementById('loadingMessage');
  if (loadingMessage) {
    loadingMessage.textContent = message;
  }
  
  overlay.classList.add('active');
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// Show inline loading spinner
function showInlineLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '<div class="loading-spinner"></div>';
  }
}

// Image zoom/lightbox with carousel support
let modalImages = []; // Array to store all images for current product
let currentModalImageIndex = 0; // Current image index in modal

function initImageZoom() {
  // Create modal if it doesn't exist
  let modal = document.getElementById('imageModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'image-modal';
    modal.innerHTML = `
      <button class="image-modal-close" onclick="closeImageModal()" aria-label="Close image modal">×</button>
      <button class="image-modal-prev" onclick="prevModalImage()" aria-label="Previous image">‹</button>
      <button class="image-modal-next" onclick="nextModalImage()" aria-label="Next image">›</button>
      <img class="image-modal-content" id="modalImage" alt="Zoomed image">
      <div class="image-modal-indicators" id="modalIndicators" role="tablist" aria-label="Image navigation"></div>
      <div class="image-modal-counter" id="modalCounter" aria-live="polite"></div>
    `;
    document.body.appendChild(modal);
    
    // Close modal when clicking outside the image
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeImageModal();
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleModalKeyboard);
  }
  
  // Add click handlers to all product images
  document.querySelectorAll('.product-img').forEach(img => {
    img.addEventListener('click', function() {
      // Find the product card and get all images for this product
      const productCard = this.closest('.product-card');
      if (productCard) {
        const allProductImages = productCard.querySelectorAll('.product-img');
        const images = Array.from(allProductImages).map(img => img.src);
        const clickedIndex = Array.from(allProductImages).indexOf(this);
        openImageModal(images, clickedIndex >= 0 ? clickedIndex : 0);
      } else {
        // Fallback to single image
        openImageModal([this.src], 0);
      }
    });
  });
}

function handleModalKeyboard(e) {
  const modal = document.getElementById('imageModal');
  if (!modal || !modal.classList.contains('active')) return;
  
  if (e.key === 'Escape') {
    closeImageModal();
  } else if (e.key === 'ArrowLeft') {
    prevModalImage();
  } else if (e.key === 'ArrowRight') {
    nextModalImage();
  }
}

function openImageModal(images, startIndex = 0) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const prevBtn = modal.querySelector('.image-modal-prev');
  const nextBtn = modal.querySelector('.image-modal-next');
  const indicators = document.getElementById('modalIndicators');
  const counter = document.getElementById('modalCounter');
  
  if (modal && modalImg) {
    // Store images array and set current index
    modalImages = Array.isArray(images) ? images : [images];
    currentModalImageIndex = startIndex;
    
    // Show/hide navigation buttons based on image count
    if (prevBtn && nextBtn) {
      if (modalImages.length > 1) {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
      } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      }
    }
    
    // Update modal content
    updateModalImage();
    
    // Create indicators
    if (indicators && modalImages.length > 1) {
      indicators.innerHTML = modalImages.map((_, idx) => 
        `<span class="modal-indicator ${idx === currentModalImageIndex ? 'active' : ''}" 
               role="tab" 
               aria-label="Go to image ${idx + 1}" 
               aria-selected="${idx === currentModalImageIndex}" 
               tabindex="${idx === currentModalImageIndex ? 0 : -1}"
               onclick="goToModalImage(${idx})"></span>`
      ).join('');
      indicators.style.display = 'flex';
    } else if (indicators) {
      indicators.style.display = 'none';
    }
    
    // Update counter
    if (counter && modalImages.length > 1) {
      counter.textContent = `${currentModalImageIndex + 1} / ${modalImages.length}`;
      counter.style.display = 'block';
    } else if (counter) {
      counter.style.display = 'none';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
}

function updateModalImage() {
  const modalImg = document.getElementById('modalImage');
  const indicators = document.getElementById('modalIndicators');
  const counter = document.getElementById('modalCounter');
  
  if (modalImg && modalImages.length > 0) {
    modalImg.src = modalImages[currentModalImageIndex];
    
    // Update indicators
    if (indicators) {
      const allIndicators = indicators.querySelectorAll('.modal-indicator');
      allIndicators.forEach((indicator, idx) => {
        if (idx === currentModalImageIndex) {
          indicator.classList.add('active');
          indicator.setAttribute('aria-selected', 'true');
          indicator.setAttribute('tabindex', '0');
        } else {
          indicator.classList.remove('active');
          indicator.setAttribute('aria-selected', 'false');
          indicator.setAttribute('tabindex', '-1');
        }
      });
    }
    
    // Update counter
    if (counter && modalImages.length > 1) {
      counter.textContent = `${currentModalImageIndex + 1} / ${modalImages.length}`;
    }
  }
}

function nextModalImage() {
  if (modalImages.length > 1) {
    currentModalImageIndex = (currentModalImageIndex + 1) % modalImages.length;
    updateModalImage();
  }
}

function prevModalImage() {
  if (modalImages.length > 1) {
    currentModalImageIndex = (currentModalImageIndex - 1 + modalImages.length) % modalImages.length;
    updateModalImage();
  }
}

function goToModalImage(index) {
  if (index >= 0 && index < modalImages.length) {
    currentModalImageIndex = index;
    updateModalImage();
  }
}

function closeImageModal() {
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    
    // Clear modal state
    modalImages = [];
    currentModalImageIndex = 0;
  }
}

// Check if current user is an admin using backend API
async function checkIsAdmin(user) {
  if (!user) return false;
  
  // Cache duration for admin status checks (in milliseconds)
  const ADMIN_STATUS_CACHE_DURATION = 5000; // 5 seconds
  
  // Use cached admin status if available and fresh
  const cacheAge = Date.now() - (window._cachedAdminStatusTime || 0);
  if (window._cachedAdminStatus !== undefined && cacheAge < ADMIN_STATUS_CACHE_DURATION) {
    return window._cachedAdminStatus;
  }
  
  const API_BASE = window.API_BASE || 'https://bonnie-lass-florals.onrender.com';
  
  try {
    // Force token refresh to get latest custom claims
    const idToken = await user.getIdToken(true);
    const response = await fetch(`${API_BASE}/api/admin/check`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });

    if (!response.ok) {
      console.error('Admin check failed with status', response.status);
      return false;
    }

    const data = await response.json();
    const isAdmin = data.isAdmin === true;
    
    // Cache the result
    window._cachedAdminStatus = isAdmin;
    window._cachedAdminStatusTime = Date.now();
    
    return isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Expose functions to global scope
window.showNotification = showNotification;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showInlineLoading = showInlineLoading;
window.initImageZoom = initImageZoom;
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.nextModalImage = nextModalImage;
window.prevModalImage = prevModalImage;
window.goToModalImage = goToModalImage;
window.checkIsAdmin = checkIsAdmin;
