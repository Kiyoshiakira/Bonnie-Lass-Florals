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

// Image zoom/lightbox
function initImageZoom() {
  // Create modal if it doesn't exist
  let modal = document.getElementById('imageModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'image-modal';
    modal.innerHTML = `
      <button class="image-modal-close" onclick="closeImageModal()">×</button>
      <img class="image-modal-content" id="modalImage" alt="Zoomed image">
    `;
    document.body.appendChild(modal);
    
    // Close modal when clicking outside the image
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeImageModal();
      }
    });
  }
  
  // Add click handlers to all product images
  document.querySelectorAll('.product-img').forEach(img => {
    img.addEventListener('click', function() {
      openImageModal(this.src);
    });
  });
}

function openImageModal(imageSrc) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  
  if (modal && modalImg) {
    modal.classList.add('active');
    modalImg.src = imageSrc;
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
}

function closeImageModal() {
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
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
