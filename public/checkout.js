// Replace these with your real Square values from developer dashboard
const SQUARE_APP_ID = 'sq0idp-MvxpqBo-vgra-5CNbtbRNA'; // Use your real PRODUCTION App ID here
const SQUARE_LOCATION_ID = 'LRQ7E9SCJND41'; // Use your real PRODUCTION Location ID

let payments, card;

async function initializeSquare() {
  if (!window.Square) {
    document.getElementById('checkoutStatus').textContent = "Square payments SDK failed to load.";
    return;
  }
  payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
  card = await payments.card();
  await card.attach('#squarePaymentForm');
}

function renderCartSummary() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const summaryDiv = document.getElementById('cart-summary');
  if (!cart.length) {
    summaryDiv.innerHTML = '<div style="color:#d946ef;font-weight:bold;text-align:center;padding:2rem;">Your cart is empty.</div>';
    return;
  }
  let total = 0;
  let html = `
    <h2 style="color:#421e7c;margin-bottom:1rem;">Order Summary</h2>
    <table style="width:100%;margin-bottom:1.5em;border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:2px solid #e4d8f7;">
          <th style="text-align:left;padding:0.8rem;">Product</th>
          <th style="text-align:center;padding:0.8rem;">Qty</th>
          <th style="text-align:right;padding:0.8rem;">Price</th>
          <th style="text-align:right;padding:0.8rem;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
  `;
  cart.forEach(item => {
    const price = Number(item.price) || 0;
    const qty = item.quantity || 1;
    const subtotal = price * qty;
    total += subtotal;
    html += `
      <tr style="border-bottom:1px solid #f0f0f0;">
        <td style="padding:0.8rem;">
          <div style="display:flex;align-items:center;gap:0.8rem;">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" class="cart-item-thumbnail">` : ''}
            <span style="font-weight:500;color:#421e7c;">${item.name}</span>
          </div>
        </td>
        <td style="text-align:center;padding:0.8rem;color:#666;">${qty}</td>
        <td style="text-align:right;padding:0.8rem;color:#666;">$${price.toFixed(2)}</td>
        <td style="text-align:right;padding:0.8rem;font-weight:bold;color:#421e7c;">$${subtotal.toFixed(2)}</td>
      </tr>
    `;
  });
  html += `
      </tbody>
      <tfoot>
        <tr style="border-top:2px solid #e4d8f7;">
          <td colspan="3" style="text-align:right;font-weight:bold;padding:1rem;color:#421e7c;font-size:1.1rem;">Total:</td>
          <td style="text-align:right;font-weight:bold;padding:1rem;color:#d946ef;font-size:1.2rem;">$${total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  `;
  summaryDiv.innerHTML = html;
}

// Update cart count in nav
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  document.querySelectorAll('.cart-btn span').forEach(el => el.textContent = totalItems);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartSummary();
  updateCartCount();
  initializeSquare();
});

document.getElementById('shippingForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  console.log('Pay Now clicked'); // For debugging - see if handler is running
  
  const statusDiv = document.getElementById('checkoutStatus');
  statusDiv.textContent = '';

  const form = e.target;
  const shippingAddress = {
    name: document.getElementById('name').value,
    street: document.getElementById('street').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    zip: document.getElementById('zip').value,
    country: document.getElementById('country').value
  };

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (!cart.length) {
    if (typeof showNotification === 'function') {
      showNotification('Your cart is empty!', 'error');
    } else {
      alert('Your cart is empty!');
    }
    return;
  }
  
  const items = cart.map(item => ({
    product: item.id,
    quantity: item.quantity || 1
  }));
  const total = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.quantity || 1)), 0);

  // Only handling Square for now
  try {
    // Show loading
    if (typeof showLoading === 'function') {
      showLoading('Processing payment...');
    }
    
    // 1. Tokenize card
    const result = await card.tokenize();
    if (result.status !== 'OK') {
      if (typeof hideLoading === 'function') hideLoading();
      statusDiv.innerHTML = '<div style="color:#ef4444;padding:1rem;background:#fee;border-radius:0.5rem;margin-top:1rem;">Card entry failed. Please check your information.</div>';
      return;
    }
    
    // 2. POST to backend to process payment and create order
    const res = await fetch('https://bonnie-lass-florals.onrender.com/api/payments/square', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceId: result.token,
        shippingAddress,
        items,
        total
      })
    });
    
    const data = await res.json();
    
    if (typeof hideLoading === 'function') hideLoading();
    
    if(res.ok) {
      statusDiv.innerHTML = '<div style="color:#10b981;padding:1rem;background:#d1fae5;border-radius:0.5rem;margin-top:1rem;font-weight:bold;">' + (data.message || 'Order placed and paid successfully!') + ' Redirecting to shop...</div>';
      
      if (typeof showNotification === 'function') {
        showNotification('Order placed successfully!', 'success');
      }
      
      localStorage.removeItem('cart');
      updateCartCount();
      setTimeout(() => window.location = 'shop.html', 3000);
    } else {
      statusDiv.innerHTML = '<div style="color:#ef4444;padding:1rem;background:#fee;border-radius:0.5rem;margin-top:1rem;">' + (data.error || 'Payment failed.') + '</div>';
      
      if (typeof showNotification === 'function') {
        showNotification(data.error || 'Payment failed', 'error');
      }
    }
  } catch(err) {
    if (typeof hideLoading === 'function') hideLoading();
    
    const errorMsg = "Payment error: " + (err.message || err);
    statusDiv.innerHTML = '<div style="color:#ef4444;padding:1rem;background:#fee;border-radius:0.5rem;margin-top:1rem;">' + errorMsg + '</div>';
    
    if (typeof showNotification === 'function') {
      showNotification(errorMsg, 'error');
    }
  }
});
