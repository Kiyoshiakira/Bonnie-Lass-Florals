// Theme Loader - Fetches and applies saved site theme
// This script should be included early in the HTML head to minimize FOUC (Flash of Unstyled Content)
(function() {
  // Determine API base URL (use environment or default to production backend)
  const hostname = window.location.hostname;
  const API_BASE = (hostname === 'localhost' || hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : 'https://bonnie-lass-florals.onrender.com';

  // Fetch and apply theme
  fetch(API_BASE + '/api/settings/theme')
    .then(response => {
      // Check if response is OK and is JSON
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      return response.json();
    })
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
