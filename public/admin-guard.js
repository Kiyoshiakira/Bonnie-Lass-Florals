// Admin Guard - Protects admin pages from unauthorized access
// This script should be included in all admin pages before any other scripts
(function() {
  'use strict';

  // API Base URL
  const API_BASE = window.API_BASE || 'https://bonnie-lass-florals.onrender.com';

  // Check if user is admin using backend API
  async function checkAdminStatus(user) {
    try {
      // Force token refresh to get latest custom claims
      const idToken = await user.getIdToken(true);
      const response = await fetch(`${API_BASE}/api/admin/check`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        console.error('Admin guard: API check failed with status', response.status);
        return false;
      }

      const data = await response.json();
      return data.isAdmin === true;
    } catch (error) {
      console.error('Admin guard: Error checking admin status', error);
      return false;
    }
  }

  // Redirect to home page if not admin
  function redirectToHome() {
    window.location.href = '../index.html';
  }

  // Wait for Firebase to be ready
  function initAdminGuard() {
    if (!window.firebase || !firebase.auth) {
      // Firebase not loaded yet, wait and try again
      setTimeout(initAdminGuard, 100);
      return;
    }

    firebase.auth().onAuthStateChanged(async function(user) {
      if (!user) {
        // Not logged in - redirect
        console.log('Admin guard: User not logged in, redirecting to home');
        redirectToHome();
      } else {
        // Check admin status via API
        const isAdmin = await checkAdminStatus(user);
        if (!isAdmin) {
          // Logged in but not admin - redirect
          console.log('Admin guard: User is not an admin, redirecting to home');
          redirectToHome();
        } else {
          // User is admin - allow access
          console.log('Admin guard: Admin access granted for', user.email);
        }
      }
    });
  }

  // Start guard when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminGuard);
  } else {
    initAdminGuard();
  }
})();
