document.getElementById('authForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  // Get input values
  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;
  const nameField = e.target.querySelector('input[type="text"]');
  const name = nameField ? nameField.value : "";

  // Check if signup or login
  const isSignup = !document.getElementById('signupFields').classList.contains('hidden');
  // UPDATED: Use full Render API URL
  const apiBase = 'https://bonnie-lass-florals.onrender.com';
  const endpoint = isSignup ? `${apiBase}/api/auth/signup` : `${apiBase}/api/auth/login`;
  const body = isSignup ? { email, password, name } : { email, password };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (res.ok) {
      alert(data.message || 'Success!');
      document.getElementById('loginModal').classList.add('hidden');
      document.getElementById('loginBtn').textContent = 'Profile';
    } else {
      alert(data.error || 'There was a problem.');
    }
  } catch (error) {
    alert('Network error!');
  }
});
