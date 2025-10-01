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

document.addEventListener('DOMContentLoaded', () => {
  // Always initialize Square for now (only option)
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
  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

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
