document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = e.target.querySelector('input[name="name"]').value;
  const email = e.target.querySelector('input[name="email"]').value;
  const message = e.target.querySelector('textarea[name="message"]').value;

  try {
    // Show loading
    if (typeof showLoading === 'function') {
      showLoading('Sending message...');
    }
    
    // Use API_BASE from window or default to Render URL
    const API_BASE = window.API_BASE || 'https://bonnie-lass-florals.onrender.com';
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const data = await res.json();

    // Hide loading
    if (typeof hideLoading === 'function') {
      hideLoading();
    }

    if (res.ok) {
      if (typeof showNotification === 'function') {
        showNotification(data.message || 'Message sent successfully!', 'success');
      } else {
        alert(data.message || 'Message sent!');
      }
      e.target.reset();
    } else {
      if (typeof showNotification === 'function') {
        showNotification(data.error || 'There was a problem sending your message.', 'error');
      } else {
        alert(data.error || 'There was a problem.');
      }
    }
  } catch (error) {
    // Hide loading
    if (typeof hideLoading === 'function') {
      hideLoading();
    }
    
    if (typeof showNotification === 'function') {
      showNotification('Network error! Please check your connection and try again.', 'error');
    } else {
      alert('Network error!');
    }
  }
});

// Pre-fill message from URL params (e.g. rental inquiry links)
(function prefillFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const subject = params.get('subject');
  if (subject) {
    const messageField = document.getElementById('message');
    if (messageField && !messageField.value) {
      messageField.value = subject + '\n\n';
      messageField.focus();
      // Move cursor to end of pre-filled text
      messageField.setSelectionRange(messageField.value.length, messageField.value.length);
    }
  }
})();

