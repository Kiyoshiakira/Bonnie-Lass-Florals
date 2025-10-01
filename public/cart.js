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
  const countElem = document.getElementById('cart-count');
  if (countElem) countElem.textContent = cart.length;
}
document.addEventListener('DOMContentLoaded', updateCartCount);
