document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = e.target.querySelector('input[name="name"]').value;
  const email = e.target.querySelector('input[name="email"]').value;
  const message = e.target.querySelector('textarea[name="message"]').value;

  try {
    // UPDATED: Use full Render API URL
    const res = await fetch('https://bonnie-lass-florals.onrender.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const data = await res.json();

    if (res.ok) {
      alert(data.message || 'Message sent!');
      e.target.reset();
    } else {
      alert(data.error || 'There was a problem.');
    }
  } catch (error) {
    alert('Network error!');
  }
});
