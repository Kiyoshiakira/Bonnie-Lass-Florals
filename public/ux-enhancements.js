/**
 * UX Enhancements - Bonnie Lass Florals
 * Enhanced user experience features including back-to-top button and smooth scrolling
 */

(function() {
  'use strict';

  // Back to Top Button
  function initBackToTop() {
    // Create back-to-top button
    const backToTop = document.createElement('button');
    backToTop.id = 'backToTop';
    backToTop.innerHTML = '↑';
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.style.display = 'none';
    document.body.appendChild(backToTop);

    // Show/hide button based on scroll position
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function() {
        if (window.pageYOffset > 300) {
          backToTop.style.display = 'flex';
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
          setTimeout(() => {
            if (!backToTop.classList.contains('visible')) {
              backToTop.style.display = 'none';
            }
          }, 300);
        }
      }, 100);
    });

    // Scroll to top when clicked
    backToTop.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Add fade-in animation to elements as they come into view
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe product cards, gallery items, and pricing cards
    const elementsToAnimate = document.querySelectorAll(
      '.product-card, .gallery-item, .pricing-card'
    );
    
    elementsToAnimate.forEach(el => {
      el.classList.add('animate-on-scroll');
      observer.observe(el);
    });
  }

  // Add ripple effect to buttons
  function initRippleEffect() {
    const buttons = document.querySelectorAll('button, .cta-btn');
    
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }

  // Initialize all enhancements when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initBackToTop();
      initScrollAnimations();
      initRippleEffect();
    });
  } else {
    initBackToTop();
    initScrollAnimations();
    initRippleEffect();
  }
})();
