const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

describe('Shop Page Edit Product Feature', function() {
  let dom;
  let window;
  let document;

  beforeEach(function() {
    // Create a fresh DOM for each test with the shop.html content
    const shopHtmlPath = path.join(__dirname, '../public/shop.html');
    const shopHtml = fs.readFileSync(shopHtmlPath, 'utf8');
    
    dom = new JSDOM(shopHtml, { 
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable'
    });

    window = dom.window;
    document = window.document;
  });

  it('should have edit product modal in HTML', function() {
    const modal = document.getElementById('editProductModal');
    expect(modal).to.exist;
    expect(modal.classList.contains('edit-product-modal')).to.be.true;
  });

  it('should have all required form fields in edit modal', function() {
    const productId = document.getElementById('editProductId');
    const productName = document.getElementById('editProductName');
    const productDescription = document.getElementById('editProductDescription');
    const productPrice = document.getElementById('editProductPrice');
    const productType = document.getElementById('editProductType');
    const productStock = document.getElementById('editProductStock');
    const productOptions = document.getElementById('editProductOptions');
    const productImage = document.getElementById('editProductImage');

    expect(productId).to.exist;
    expect(productName).to.exist;
    expect(productName.required).to.be.true;
    expect(productDescription).to.exist;
    expect(productPrice).to.exist;
    expect(productPrice.required).to.be.true;
    expect(productType).to.exist;
    expect(productStock).to.exist;
    expect(productStock.required).to.be.true;
    expect(productOptions).to.exist;
    expect(productImage).to.exist;
  });

  it('should have cancel button in edit modal', function() {
    const cancelBtn = document.getElementById('cancelEditProduct');
    expect(cancelBtn).to.exist;
    expect(cancelBtn.type).to.equal('button');
  });

  it('should have error and success message divs', function() {
    const errorDiv = document.getElementById('editProductError');
    const successDiv = document.getElementById('editProductSuccess');
    
    expect(errorDiv).to.exist;
    expect(successDiv).to.exist;
    expect(errorDiv.style.display).to.equal('none');
    expect(successDiv.style.display).to.equal('none');
  });

  it('should have edit product form', function() {
    const form = document.getElementById('editProductForm');
    expect(form).to.exist;
    expect(form.tagName).to.equal('FORM');
  });
});
