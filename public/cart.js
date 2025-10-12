function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}
function addToCart(item) {
  const cart = getCart();
  cart.push(item);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  const cart = getCart();
  document.querySelectorAll('#cart-count, .cart-btn span').forEach(el => el.textContent = cart.length);
}

// Render the cart items in the cart page
function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cart-items');
  if (!container) return;
  if (cart.length === 0) {
    container.innerHTML = `<div style="color:#d946ef;font-weight:bold;">Your cart is empty.</div>`;
    return;
  }
  let total = 0;
  let html = `
    <table style="width:100%;border-collapse:collapse;margin-bottom:1em;">
      <thead>
        <tr>
          <th style="text-align:left;">Product</th>
          <th style="text-align:right;">Price</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Subtotal</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
  `;
  cart.forEach((item, idx) => {
    const price = Number(item.price) || 0;
    const qty = item.quantity || 1;
    const subtotal = price * qty;
    total += subtotal;
    html += `
      <tr>
        <td>${item.name}</td>
        <td style="text-align:right;">$${price.toFixed(2)}</td>
        <td style="text-align:center;">${qty}</td>
        <td style="text-align:right;">$${subtotal.toFixed(2)}</td>
        <td style="text-align:center;">
          <button onclick="removeFromCart(${idx})" style="color:#fff;background:#d946ef;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;">Remove</button>
        </td>
      </tr>
    `;
  });
  html += `
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align:right;font-weight:bold;">Total:</td>
          <td style="text-align:right;font-weight:bold;">$${total.toFixed(2)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  `;
  container.innerHTML = html;
}

// Remove an item from the cart by its index
function removeFromCart(idx) {
  const cart = getCart();
  cart.splice(idx, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderCart();
});

// Expose removeFromCart to global scope
window.removeFromCart = removeFromCart;
