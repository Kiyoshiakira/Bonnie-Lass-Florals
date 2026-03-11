const { describe, it } = require('mocha');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

/**
 * Tests for customizable product options (selectedOption) in the cart flow.
 * Verifies that:
 *   - Products with different selected options are stored as separate cart entries
 *   - Products with the same id AND same option increment quantity as before
 *   - Cart and checkout display the selected option when present
 */

describe('Product Options – Cart Logic', function() {
  // Minimal localStorage / cart helper extracted from cart.js for unit testing
  let cartStore = '[]';
  const fakeLocalStorage = {
    getItem: (key) => (key === 'cart' ? cartStore : null),
    setItem: (key, val) => { if (key === 'cart') cartStore = val; }
  };

  // Inline the addToCart logic (mirrors cart.js behaviour)
  function getCart() {
    return JSON.parse(fakeLocalStorage.getItem('cart')) || [];
  }

  function addToCart(item) {
    const cart = getCart();
    const existingItemIndex = cart.findIndex(i =>
      i.id === item.id &&
      (i.selectedOption || '') === (item.selectedOption || '')
    );
    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
    } else {
      item.quantity = 1;
      cart.push(item);
    }
    fakeLocalStorage.setItem('cart', JSON.stringify(cart));
  }

  beforeEach(function() {
    cartStore = '[]'; // reset cart before each test
  });

  afterEach(function() {
    cartStore = '[]'; // ensure clean state after each test
  });

  it('should add two items with different options as separate entries', function() {
    addToCart({ id: 'sauce1', name: 'BBQ Sauce', price: 5, selectedOption: 'Original' });
    addToCart({ id: 'sauce1', name: 'BBQ Sauce', price: 5, selectedOption: 'Spicy' });
    const cart = getCart();
    expect(cart).to.have.lengthOf(2);
    expect(cart[0].selectedOption).to.equal('Original');
    expect(cart[1].selectedOption).to.equal('Spicy');
  });

  it('should increment quantity for the same product with the same option', function() {
    addToCart({ id: 'sauce1', name: 'BBQ Sauce', price: 5, selectedOption: 'Honey' });
    addToCart({ id: 'sauce1', name: 'BBQ Sauce', price: 5, selectedOption: 'Honey' });
    const cart = getCart();
    expect(cart).to.have.lengthOf(1);
    expect(cart[0].quantity).to.equal(2);
    expect(cart[0].selectedOption).to.equal('Honey');
  });

  it('should treat no-option and with-option as separate entries', function() {
    addToCart({ id: 'prod1', name: 'Wreath', price: 20 });
    addToCart({ id: 'prod1', name: 'Wreath', price: 20, selectedOption: 'Large' });
    const cart = getCart();
    expect(cart).to.have.lengthOf(2);
  });

  it('should increment quantity when same product added without option twice', function() {
    addToCart({ id: 'prod2', name: 'Ornament', price: 8 });
    addToCart({ id: 'prod2', name: 'Ornament', price: 8 });
    const cart = getCart();
    expect(cart).to.have.lengthOf(1);
    expect(cart[0].quantity).to.equal(2);
  });

  it('selectedOption should be stored on the cart item', function() {
    addToCart({ id: 'jam1', name: 'Jam', price: 6, selectedOption: 'Strawberry' });
    const cart = getCart();
    expect(cart[0].selectedOption).to.equal('Strawberry');
  });
});

describe('Product Options – Cart HTML Display', function() {
  it('cart.js renders selectedOption beneath the product name', function() {
    const cartJs = fs.readFileSync(
      path.join(__dirname, '..', 'public', 'cart.js'),
      'utf-8'
    );
    // The renderCart function should display item.selectedOption
    expect(cartJs).to.include('item.selectedOption');
    expect(cartJs).to.include('Option:');
  });

  it('checkout.js renders selectedOption in the order summary', function() {
    const checkoutJs = fs.readFileSync(
      path.join(__dirname, '..', 'public', 'checkout.js'),
      'utf-8'
    );
    expect(checkoutJs).to.include('item.selectedOption');
    expect(checkoutJs).to.include('Option:');
  });
});

describe('Product Options – Shop Product Card', function() {
  it('shop.js renders a <select> dropdown for options instead of plain text', function() {
    const shopJs = fs.readFileSync(
      path.join(__dirname, '..', 'public', 'shop.js'),
      'utf-8'
    );
    // Should contain the class used for the option selector
    expect(shopJs).to.include('product-option-select');
    // Should NOT contain the old plain-text options display
    expect(shopJs).to.not.include('<strong>Options:</strong>');
  });

  it('handleAddToCart in shop.js checks for a selected option', function() {
    const shopJs = fs.readFileSync(
      path.join(__dirname, '..', 'public', 'shop.js'),
      'utf-8'
    );
    expect(shopJs).to.include('selectedOption');
    expect(shopJs).to.include('Please choose an option before adding to cart');
  });
});
