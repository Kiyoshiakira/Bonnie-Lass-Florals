// Theme Loader - Fetches and applies saved site theme
// This script should be included early in the HTML head to minimize FOUC (Flash of Unstyled Content)
(function() {
  // Determine API base URL (use environment or default to production backend)
  const hostname = window.location.hostname;
  const API_BASE = (hostname === 'localhost' || hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : 'https://bonnie-lass-florals.onrender.com';

  const THEME_STORAGE_KEY = 'bonnieLassTheme';
  const BACKGROUND_STORAGE_KEY = 'bonnieLassBackground';

  // STEP 1: Apply cached theme immediately (synchronous - no flash!)
  try {
    const cachedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (cachedTheme) {
      const theme = JSON.parse(cachedTheme);
      applyTheme(theme);
    }
  } catch (err) {
    console.warn('Failed to load cached theme:', err);
  }

  // STEP 2: Apply cached background immediately (synchronous - no flash!)
  try {
    const cachedBackground = localStorage.getItem(BACKGROUND_STORAGE_KEY);
    if (cachedBackground) {
      applyBackground(cachedBackground);
    }
  } catch (err) {
    console.warn('Failed to load cached background:', err);
  }

  // STEP 3: Fetch latest theme from server in background and update if changed
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
        // Save to localStorage for next page load
        try {
          localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(data.theme));
        } catch (err) {
          console.warn('Failed to cache theme:', err);
        }
        // Apply the theme (will update if different from cached version)
        applyTheme(data.theme);
      }
    })
    .catch(err => {
      // Silently fail - cached or default CSS variables will be used
      console.warn('Theme loader failed:', err);
    });

  // STEP 4: Fetch latest background from server in background and update if changed
  fetch(API_BASE + '/api/settings/background')
    .then(response => {
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
      if (data.backgroundUrl) {
        // Save to localStorage for next page load
        try {
          localStorage.setItem(BACKGROUND_STORAGE_KEY, data.backgroundUrl);
        } catch (err) {
          console.warn('Failed to cache background:', err);
        }
        // Apply the background (will update if different from cached version)
        applyBackground(data.backgroundUrl);
      }
    })
    .catch(err => {
      // Silently fail - cached or default background will be used
      console.warn('Background loader failed:', err);
    });

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme.primary) root.style.setProperty('--floral-primary', theme.primary);
    if (theme.primary2) root.style.setProperty('--floral-primary-2', theme.primary2);
    if (theme.accent) root.style.setProperty('--floral-accent', theme.accent);
    if (theme.green) root.style.setProperty('--floral-green', theme.green);
    if (theme.cream) root.style.setProperty('--floral-cream', theme.cream);
  }

  function applyBackground(backgroundUrl) {
    // Wait for DOM to be ready
    if (document.body) {
      document.body.style.background = `url('${backgroundUrl}') center/cover fixed`;
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        document.body.style.background = `url('${backgroundUrl}') center/cover fixed`;
      });
    }
  }
})();
