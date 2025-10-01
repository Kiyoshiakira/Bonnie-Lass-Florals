// Wait for DOM
document.addEventListener('DOMContentLoaded', function() {
  const profileInfo = document.getElementById('profileInfo');
  const userPhoto = document.getElementById('profilePhoto');
  const userName = document.getElementById('profileName');
  const userEmail = document.getElementById('profileEmail');
  const userRole = document.getElementById('profileRole');
  const ordersSection = document.getElementById('orderHistory');
  const guestPrompt = document.getElementById('guestPrompt');

  function setProfile(user, role) {
    if (userPhoto) userPhoto.src = user.photoURL || "img/default-avatar.png";
    if (userName) userName.textContent = user.displayName || user.email;
    if (userEmail) userEmail.textContent = user.email;
    if (userRole) userRole.textContent = role;
    if (profileInfo) profileInfo.style.display = "";
    if (guestPrompt) guestPrompt.style.display = "none";
  }

  function hideProfile() {
    if (profileInfo) profileInfo.style.display = "none";
    if (ordersSection) ordersSection.style.display = "none";
    if (guestPrompt) guestPrompt.style.display = "";
  }

  async function fetchOrders(token) {
    if (!ordersSection) return;
    ordersSection.innerHTML = "<div>Loading your orders...</div>";
    try {
      const headers = token
        ? { 'Authorization': 'Bearer ' + token }
        : {};
      const res = await fetch("https://bonnie-lass-florals.onrender.com/api/orders/mine", { headers });
      if (!res.ok) throw new Error("Could not fetch orders");
      const orders = await res.json();
      if (orders.length === 0) {
        ordersSection.innerHTML = "<div>You have no orders yet.</div>";
        return;
      }
      ordersSection.innerHTML = orders.map(orderToHtml).join("");
    } catch (err) {
      ordersSection.innerHTML = "<div style='color:red'>Could not load order history.</div>";
    }
  }

  function orderToHtml(order) {
    const createdAt = new Date(order.createdAt).toLocaleString();
    const status = order.status || "Processing";
    const total = order.total ? `$${Number(order.total).toFixed(2)}` : "";
    const items = (order.items || []).map(item =>
      `<li>${item.quantity} × ${item.product?.name || 'Product'}</li>`
    ).join("");
    const shipping = order.shippingAddress
      ? `<div><strong>Ship To:</strong> ${order.shippingAddress.name}, ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}, ${order.shippingAddress.country}</div>`
      : "";
    return `
      <div class="order-card" style="margin:1em 0;padding:1em 0;border-bottom:1px solid #eee;">
        <div><strong>Order Date:</strong> ${createdAt}</div>
        <div><strong>Status:</strong> ${status}</div>
        <div><strong>Total:</strong> ${total}</div>
        <div><strong>Items:</strong></div>
        <ul>${items}</ul>
        ${shipping}
      </div>
    `;
  }

  if (window.firebase && firebase.auth) {
    firebase.auth().onAuthStateChanged(async function(user) {
      if (user) {
        const admins = ["shaunessy24@gmail.com", "bonnielassflorals@gmail.com"];
        let role = admins.includes(user.email.toLowerCase()) ? "Admin" : "Customer";
        setProfile(user, role);

        // Get Firebase ID token for backend authorization
        const token = await user.getIdToken();
        fetchOrders(token);
      } else {
        hideProfile();
      }
    });
  } else {
    // Fallback: use localStorage (not secure, but allows minimal guest display)
    const name = localStorage.getItem('userName') || "";
    const email = localStorage.getItem('userEmail') || "";
    const photo = localStorage.getItem('userPhoto') || "img/default-avatar.png";
    const role = localStorage.getItem('userRole') || "Customer";
    if (email) {
      setProfile({ displayName: name, email, photoURL: photo }, role);
      fetchOrders();
    } else {
      hideProfile();
    }
  }
});
