/* Input history: lets user press ↑ / ↓ to cycle previous entries for a field
   Usage: add data-history="products_title" to input/textarea elements you want tracked.
   Stores history in localStorage under key blf:history:<name>. */
(function () {
  const STORAGE = window.localStorage; // or window.sessionStorage
  const MAX_ITEMS = 30;

  function storageKey(name) { return `blf:history:${name}`; }

  function getHistory(name) {
    try {
      const raw = STORAGE.getItem(storageKey(name));
      return raw ? JSON.parse(raw) : [];
    } catch (_e) {
      return [];
    }
  }

  function saveHistory(name, arr) {
    try {
      STORAGE.setItem(storageKey(name), JSON.stringify(arr.slice(0, MAX_ITEMS)));
    } catch (_e) { /* ignore storage errors */ }
  }

  function pushHistory(name, value) {
    if (!value || !value.trim()) return;
    const arr = getHistory(name);
    // remove existing duplicate
    const idx = arr.indexOf(value);
    if (idx !== -1) arr.splice(idx, 1);
    arr.unshift(value);
    saveHistory(name, arr);
  }

  function bindField(el) {
    const name = el.dataset.history || el.id || el.name;
    if (!name) return;
    let idx = -1; // -1 means "current / editing value"

    // helpful tooltip
    if (!el.title) el.title = 'Use ↑ / ↓ to cycle previous entries';

    el.addEventListener('keydown', (e) => {
      // Only handle arrow keys without modifiers (allow Ctrl/Meta for user to use OS shortcuts)
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

      // For textarea allow normal caret movement unless caret at start (so entering newline still works)
      if (el.tagName === 'TEXTAREA') {
        try {
          // selectionStart supported on inputs and textareas
          const selStart = el.selectionStart;
          const selEnd = el.selectionEnd;
          if (selStart !== 0 || selEnd !== 0) return; // allow normal behavior
        } catch (_) { /* if selectionStart not supported, still process */ }
      }

      const history = getHistory(name);
      if (!history.length) return;

      e.preventDefault();

      if (e.key === 'ArrowUp') {
        // older entries increase index
        if (idx < history.length - 1) idx += 1;
        // wrap-around optional: uncomment if you want
        // else idx = 0;
      } else { // ArrowDown
        if (idx > -1) idx -= 1;
        // if we moved past newest, clear the field
      }

      if (idx === -1) {
        // back to editing buffer: leave blank (or could restore previous typed value if you track it)
        el.value = '';
      } else {
        el.value = history[idx] || '';
        // move caret to end
        try { el.setSelectionRange(el.value.length, el.value.length); } catch (_) { }
      }
    });

    // Save on blur and on form submit
    el.addEventListener('blur', () => pushHistory(name, el.value));
    if (el.form) {
      el.form.addEventListener('submit', () => pushHistory(name, el.value));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Attach to elements that opt-in by data-history attribute
    const els = document.querySelectorAll('input[data-history], textarea[data-history], select[data-history]');
    els.forEach(bindField);
  });

  // Expose a small API if you want to call from console
  window.BLFInputHistory = {
    getHistory,
    pushHistory,
    storageKey
  };
})();
