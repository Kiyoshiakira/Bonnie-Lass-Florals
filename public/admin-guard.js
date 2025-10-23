// Admin Guard - Protects admin pages from unauthorized access
// This script should be included in all admin pages before any other scripts
(function() {
  'use strict';

  // List of admin emails - must match backend configuration
  const ADMIN_EMAILS = [
    'shaunessy24@gmail.com',
    'bonnielassflorals@gmail.com'
  ];

  // Check if user is admin
  function isAdmin(user) {
    if (!user || !user.email) return false;
    return ADMIN_EMAILS.includes(user.email.toLowerCase());
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

    firebase.auth().onAuthStateChanged(function(user) {
      if (!user) {
        // Not logged in - redirect
        console.log('Admin guard: User not logged in, redirecting to home');
        redirectToHome();
      } else if (!isAdmin(user)) {
        // Logged in but not admin - redirect
        console.log('Admin guard: User is not an admin, redirecting to home');
        redirectToHome();
      } else {
        // User is admin - allow access
        console.log('Admin guard: Admin access granted for', user.email);
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
