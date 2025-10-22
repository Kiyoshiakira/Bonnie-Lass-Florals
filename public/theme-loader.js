// Theme Loader - Fetches and applies saved site theme
// This script should be included early in the HTML head to minimize FOUC (Flash of Unstyled Content)
(function() {
  // Determine API base URL (use environment or default to production)
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://bonnielassflorals.com';

  // Fetch and apply theme
  fetch(API_BASE + '/api/settings/theme')
    .then(response => response.json())
    .then(data => {
      if (data.theme) {
        applyTheme(data.theme);
      }
    })
    .catch(err => {
      // Silently fail - default CSS variables will be used
      console.warn('Theme loader failed:', err);
    });

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme.primary) root.style.setProperty('--floral-primary', theme.primary);
    if (theme.primary2) root.style.setProperty('--floral-primary-2', theme.primary2);
    if (theme.accent) root.style.setProperty('--floral-accent', theme.accent);
    if (theme.green) root.style.setProperty('--floral-green', theme.green);
    if (theme.cream) root.style.setProperty('--floral-cream', theme.cream);
  }
})();
