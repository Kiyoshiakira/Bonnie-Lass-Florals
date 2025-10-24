function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function addToCart(item) {
  const cart = getCart();
  
  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(i => i.id === item.id);
  
  if (existingItemIndex >= 0) {
    // Increment quantity if item exists
    cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
  } else {
    // Add new item with quantity 1
    item.quantity = 1;
    cart.push(item);
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  // Show notification
  if (typeof showNotification === 'function') {
    showNotification(`${item.name} added to cart!`, 'success', 3000);
  }
}

function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  document.querySelectorAll('#cart-count, .cart-btn span').forEach(el => el.textContent = totalItems);
}

// Update item quantity
function updateQuantity(idx, delta) {
  const cart = getCart();
  if (cart[idx]) {
    cart[idx].quantity = Math.max(1, (cart[idx].quantity || 1) + delta);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
  }
}

// Render the cart items in the cart page
function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cart-items');
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = `<div style="color:#d946ef;font-weight:bold;text-align:center;padding:2rem;">Your cart is empty.</div>`;
    return;
  }
  
  let total = 0;
  let html = `
    <table style="width:100%;border-collapse:collapse;margin-bottom:1em;">
      <thead>
        <tr style="border-bottom:2px solid #e4d8f7;">
          <th style="text-align:left;padding:0.8rem;">Product</th>
          <th style="text-align:right;padding:0.8rem;">Price</th>
          <th style="text-align:center;padding:0.8rem;">Quantity</th>
          <th style="text-align:right;padding:0.8rem;">Subtotal</th>
          <th style="padding:0.8rem;"></th>
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
      <tr style="border-bottom:1px solid #f0f0f0;">
        <td style="padding:1rem;">
          <div style="display:flex;align-items:center;gap:1rem;">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" class="cart-item-thumbnail" width="60" height="60" loading="lazy">` : ''}
            <span style="font-weight:500;color:#421e7c;">${item.name}</span>
          </div>
        </td>
        <td style="text-align:right;padding:1rem;color:#666;">$${price.toFixed(2)}</td>
        <td style="text-align:center;padding:1rem;">
          <div class="cart-quantity-controls">
            <button class="cart-quantity-btn" onclick="updateQuantity(${idx}, -1)">-</button>
            <span class="cart-quantity-display">${qty}</span>
            <button class="cart-quantity-btn" onclick="updateQuantity(${idx}, 1)">+</button>
          </div>
        </td>
        <td style="text-align:right;padding:1rem;font-weight:bold;color:#421e7c;">$${subtotal.toFixed(2)}</td>
        <td style="text-align:center;padding:1rem;">
          <button onclick="removeFromCart(${idx})" style="color:#fff;background:#ef4444;border:none;border-radius:6px;padding:6px 12px;cursor:pointer;transition:background 0.2s;">Remove</button>
        </td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
      <tfoot>
        <tr style="border-top:2px solid #e4d8f7;">
          <td colspan="3" style="text-align:right;font-weight:bold;padding:1rem;color:#421e7c;font-size:1.1rem;">Total:</td>
          <td style="text-align:right;font-weight:bold;padding:1rem;color:#d946ef;font-size:1.2rem;">$${total.toFixed(2)}</td>
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
  const removedItem = cart[idx];
  cart.splice(idx, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
  
  if (typeof showNotification === 'function' && removedItem) {
    showNotification(`${removedItem.name} removed from cart`, 'info', 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderCart();
});

// Expose functions to global scope
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
