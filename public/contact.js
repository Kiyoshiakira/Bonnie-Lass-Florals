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
    
    // UPDATED: Use full Render API URL
    const res = await fetch('https://bonnie-lass-florals.onrender.com/api/contact', {
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

