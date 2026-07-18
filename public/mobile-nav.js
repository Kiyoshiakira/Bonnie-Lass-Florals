// Mobile Navigation Handler
(function() {
  'use strict';
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
  
  function initMobileNav() {
    // Find the header and nav elements
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    
    if (!header || !nav) {
      console.warn('Header or nav element not found');
      return;
    }

    // Ensure customer reviews hub is available from main-site navigation
    if (!window.location.pathname.includes('/admin/')) {
      const hasReviewsLink = Array.from(nav.querySelectorAll('a'))
        .some(link => link.getAttribute('href') === 'reviews.html');
      if (!hasReviewsLink) {
        const reviewsLink = document.createElement('a');
        reviewsLink.href = 'reviews.html';
        reviewsLink.textContent = 'Reviews';
        const contactLink = Array.from(nav.querySelectorAll('a'))
          .find(link => link.getAttribute('href') === 'contact.html');
        if (contactLink) {
          nav.insertBefore(reviewsLink, contactLink.nextSibling);
        } else {
          nav.appendChild(reviewsLink);
        }
      }
    }
    
    // Create hamburger menu button
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    
    // Insert hamburger before nav
    header.insertBefore(hamburger, nav);
    
    // Toggle menu on hamburger click
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      const isActive = nav.classList.toggle('active');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isActive);
      
      // Prevent body scroll when menu is open
      if (isActive) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (nav.classList.contains('active') && 
          !nav.contains(e.target) && 
          !hamburger.contains(e.target)) {
        nav.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
    
    // Close menu when clicking on a nav link
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        nav.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
    
    // Close menu on window resize to desktop size
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if (window.innerWidth > 1024) {
          nav.classList.remove('active');
          hamburger.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      }, 250);
    });
  }
})();
