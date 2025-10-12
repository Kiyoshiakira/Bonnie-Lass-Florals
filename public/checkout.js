// Replace these with your real Square values from developer dashboard
const SQUARE_APP_ID = 'sq0idp-MvxpqBo-vgra-5CNbtbRNA';
const SQUARE_LOCATION_ID = 'LRQ7E9SCJND41';

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
    summaryDiv.innerHTML = '<div style="color:#d946ef;font-weight:bold;">Your cart is empty.</div>';
    return;
  }
  let total = 0;
  let html = `
    <h2>Your Items</h2>
    <table style="width:100%;margin-bottom:1em;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:4px 0;">Product</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Price</th>
          <th style="text-align:right;">Subtotal</th>
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
      <tr>
        <td style="padding:3px 0;">${item.name}</td>
        <td style="text-align:center;">${qty}</td>
        <td style="text-align:right;">$${price.toFixed(2)}</td>
        <td style="text-align:right;">$${subtotal.toFixed(2)}</td>
      </tr>
    `;
  });
  html += `
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align:right;font-weight:bold;">Total:</td>
          <td style="text-align:right;font-weight:bold;">$${total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  `;
  summaryDiv.innerHTML = html;
}

// Update cart count in nav
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  document.querySelectorAll('.cart-btn span').forEach(el => el.textContent = cart.length);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartSummary();
  updateCartCount();
  initializeSquare();
});

document.getElementById('shippingForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  document.getElementById('checkoutStatus').textContent = '';

  const form = e.target;
  const shippingAddress = {
    name: form.querySelector('[name="name"]').value,
    street: form.querySelector('[name="street"]').value,
    city: form.querySelector('[name="city"]').value,
    state: form.querySelector('[name="state"]').value,
    zip: form.querySelector('[name="zip"]').value,
    country: form.querySelector('[name="country"]').value
  };

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (!cart.length) {
    alert('Your cart is empty!');
    return;
  }
  const items = cart.map(item => ({
    product: item.id,
    quantity: item.quantity || 1
  }));
  const total = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.quantity || 1)), 0);

  // Only handling Square for now
  try {
    // 1. Tokenize card
    const result = await card.tokenize();
    if (result.status !== 'OK') {
      document.getElementById('checkoutStatus').textContent = "Card entry failed. Please check your info.";
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
    if(res.ok) {
      document.getElementById('checkoutStatus').textContent = data.message || 'Order placed and paid!';
      localStorage.removeItem('cart');
      setTimeout(() => window.location = 'shop.html', 3000);
    } else {
      document.getElementById('checkoutStatus').textContent = data.error || 'Payment failed.';
    }
  } catch(err) {
    document.getElementById('checkoutStatus').textContent = "Payment error: " + (err.message || err);
  }
});
