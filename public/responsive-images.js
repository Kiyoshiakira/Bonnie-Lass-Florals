/**
 * Responsive Images Utility
 * Provides helper functions for generating responsive image markup
 * with proper srcset, sizes, and WebP support
 */

/**
 * Generate responsive image HTML with proper attributes for performance
 * Supports WebP format with JPEG/PNG fallback
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.src - Primary image URL
 * @param {string} options.alt - Alt text for accessibility
 * @param {string} [options.className] - CSS class name(s)
 * @param {string} [options.sizes] - Sizes attribute for responsive images
 * @param {boolean} [options.lazy=true] - Enable lazy loading
 * @param {number} [options.width] - Intrinsic width
 * @param {number} [options.height] - Intrinsic height
 * @param {Object} [options.srcset] - Optional srcset variations {width: url}
 * @returns {string} HTML string for responsive image
 */
function createResponsiveImage({
  src,
  alt = '',
  className = '',
  sizes = '100vw',
  lazy = true,
  width = null,
  height = null,
  srcset = null
}) {
  // Escape HTML attributes
  const escapeAttr = (str) => String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const escapedSrc = escapeAttr(src);
  const escapedAlt = escapeAttr(alt);
  const escapedClass = escapeAttr(className);
  const escapedSizes = escapeAttr(sizes);

  // Check if this is a WebP image
  const isWebP = src.toLowerCase().includes('.webp');
  
  // Build base attributes
  let attributes = [
    `alt="${escapedAlt}"`,
    className ? `class="${escapedClass}"` : '',
    lazy ? 'loading="lazy"' : '',
    'decoding="async"',
    width ? `width="${width}"` : '',
    height ? `height="${height}"` : ''
  ].filter(Boolean).join(' ');

  // If srcset variations are provided, use them
  if (srcset && Object.keys(srcset).length > 0) {
    const srcsetStr = Object.entries(srcset)
      .map(([w, url]) => `${escapeAttr(url)} ${w}w`)
      .join(', ');
    
    return `<img src="${escapedSrc}" srcset="${srcsetStr}" sizes="${escapedSizes}" ${attributes} />`;
  }

  // For WebP images, provide fallback using picture element
  if (isWebP) {
    const baseUrl = src.replace(/\.webp$/i, '');
    const fallbackUrl = baseUrl + '.jpg';
    
    return `
      <picture>
        <source srcset="${escapedSrc}" type="image/webp">
        <img src="${escapeAttr(fallbackUrl)}" ${attributes} />
      </picture>
    `.trim();
  }

  // Standard image tag
  return `<img src="${escapedSrc}" ${attributes} />`;
}

/**
 * Generate product card responsive image
 * Optimized for product grid display with lazy loading
 * 
 * @param {string} imageUrl - Product image URL
 * @param {string} productName - Product name for alt text
 * @returns {string} HTML string for product image
 */
function createProductImage(imageUrl, productName) {
  return createResponsiveImage({
    src: imageUrl,
    alt: productName,
    className: 'product-img',
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    lazy: true,
    width: 400,
    height: 400
  });
}

/**
 * Generate logo image with fixed dimensions
 * Not lazy loaded as it's above the fold
 * 
 * @param {string} logoUrl - Logo image URL
 * @param {number} [height=60] - Logo height in pixels
 * @returns {string} HTML string for logo image
 */
function createLogoImage(logoUrl, height = 60) {
  return createResponsiveImage({
    src: logoUrl,
    alt: 'Bonnie Lass Florals Logo',
    className: '',
    lazy: false,
    width: height, // Assuming square or aspect ratio maintained
    height: height
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createResponsiveImage,
    createProductImage,
    createLogoImage
  };
}
