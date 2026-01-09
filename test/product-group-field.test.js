const { describe, it } = require('mocha');
const { expect } = require('chai');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

/**
 * Tests for Product Group field in upload and edit forms
 * Ensures users can assign products to existing groups during creation/editing
 */

describe('Product Group Field in Forms', function() {
  describe('Upload Form (Single Product)', function() {
    let dom, document;
    
    before(function() {
      const html = fs.readFileSync(
        path.join(__dirname, '..', 'public', 'admin', 'upload.html'),
        'utf-8'
      );
      dom = new JSDOM(html);
      document = dom.window.document;
    });
    
    it('should have productGroup input field', function() {
      const productGroupInput = document.getElementById('productGroup');
      expect(productGroupInput).to.exist;
      expect(productGroupInput.tagName).to.equal('INPUT');
    });
    
    it('should have productGroup datalist for autocomplete', function() {
      const datalist = document.getElementById('productGroupList');
      expect(datalist).to.exist;
      expect(datalist.tagName).to.equal('DATALIST');
    });
    
    it('should link productGroup input to datalist', function() {
      const productGroupInput = document.getElementById('productGroup');
      expect(productGroupInput.getAttribute('list')).to.equal('productGroupList');
    });
    
    it('should have placeholder text for productGroup', function() {
      const productGroupInput = document.getElementById('productGroup');
      const placeholder = productGroupInput.getAttribute('placeholder');
      expect(placeholder).to.be.a('string');
      expect(placeholder.length).to.be.greaterThan(0);
    });
    
    it('should have data-history attribute for input history feature', function() {
      const productGroupInput = document.getElementById('productGroup');
      expect(productGroupInput.getAttribute('data-history')).to.equal('product_group');
    });
    
    it('should have help text explaining the feature', function() {
      const html = dom.window.document.body.innerHTML;
      expect(html).to.include('Group similar products');
    });
    
    it('should have populateProductGroupDatalist function', function() {
      const html = fs.readFileSync(
        path.join(__dirname, '..', 'public', 'admin', 'upload.html'),
        'utf-8'
      );
      expect(html).to.include('function populateProductGroupDatalist()');
    });
    
    it('should call populateProductGroupDatalist when products are loaded', function() {
      const html = fs.readFileSync(
        path.join(__dirname, '..', 'public', 'admin', 'upload.html'),
        'utf-8'
      );
      // Check that the function is called after populateSubcategoryFilter
      const subcategoryCallIndex = html.indexOf('populateSubcategoryFilter()');
      const productGroupCallIndex = html.indexOf('populateProductGroupDatalist()');
      
      expect(subcategoryCallIndex).to.be.greaterThan(-1);
      expect(productGroupCallIndex).to.be.greaterThan(-1);
      expect(productGroupCallIndex).to.be.greaterThan(subcategoryCallIndex);
    });
    
    it('should include productGroup in form submission data', function() {
      const html = fs.readFileSync(
        path.join(__dirname, '..', 'public', 'admin', 'upload.html'),
        'utf-8'
      );
      
      // Check that productGroup is included in the productData object
      const productDataStartIndex = html.indexOf('const productData = {');
      const productDataEndIndex = html.indexOf('};', productDataStartIndex);
      const productDataSection = html.substring(productDataStartIndex, productDataEndIndex);
      
      expect(productDataSection).to.include('productGroup: form.productGroup.value.trim()');
    });
  });
  
  describe('Edit Product Form', function() {
    let dom, document;
    
    before(function() {
      const html = fs.readFileSync(
        path.join(__dirname, '..', 'public', 'admin', 'edit-product.html'),
        'utf-8'
      );
      dom = new JSDOM(html);
      document = dom.window.document;
    });
    
    it('should have productGroup input field', function() {
      const productGroupInput = document.getElementById('productGroup');
      expect(productGroupInput).to.exist;
      expect(productGroupInput.tagName).to.equal('INPUT');
    });
    
    it('should have productGroup datalist for autocomplete', function() {
      const datalist = document.getElementById('productGroupList');
      expect(datalist).to.exist;
      expect(datalist.tagName).to.equal('DATALIST');
    });
    
    it('should link productGroup input to datalist', function() {
      const productGroupInput = document.getElementById('productGroup');
      expect(productGroupInput.getAttribute('list')).to.equal('productGroupList');
    });
    
    it('should have help text explaining the feature', function() {
      const html = dom.window.document.body.innerHTML;
      expect(html).to.include('Group similar products');
    });
    
    it('should have populateProductGroupDatalist function', function() {
      const html = fs.readFileSync(
        path.join(__dirname, '..', 'public', 'admin', 'edit-product.html'),
        'utf-8'
      );
      expect(html).to.include('function populateProductGroupDatalist(products)');
    });
    
    it('should populate productGroup value when loading product', function() {
      const html = fs.readFileSync(
        path.join(__dirname, '..', 'public', 'admin', 'edit-product.html'),
        'utf-8'
      );
      
      // Check that productGroup is populated in the populateForm function
      const populateFormIndex = html.indexOf('function populateForm(product)');
      const nextFunctionIndex = html.indexOf('function', populateFormIndex + 10);
      const populateFormSection = html.substring(populateFormIndex, nextFunctionIndex);
      
      expect(populateFormSection).to.include('productGroup').and.to.include('.value = product.productGroup');
    });
    
    it('should include productGroup in update data', function() {
      const html = fs.readFileSync(
        path.join(__dirname, '..', 'public', 'admin', 'edit-product.html'),
        'utf-8'
      );
      
      // Check that productGroup is included in the updateData object
      const updateDataStartIndex = html.indexOf('const updateData = {');
      const updateDataEndIndex = html.indexOf('};', updateDataStartIndex);
      const updateDataSection = html.substring(updateDataStartIndex, updateDataEndIndex);
      
      expect(updateDataSection).to.include('productGroup:').and.to.include('productGroup').and.to.include('.value.trim()');
    });
    
    it('should load product groups for autocomplete on page load', function() {
      const html = fs.readFileSync(
        path.join(__dirname, '..', 'public', 'admin', 'edit-product.html'),
        'utf-8'
      );
      
      // Check that populateProductGroupDatalist is called in loadProduct function
      const loadProductIndex = html.indexOf('async function loadProduct()');
      const nextFunctionIndex = html.indexOf('function', loadProductIndex + 10);
      const loadProductSection = html.substring(loadProductIndex, nextFunctionIndex);
      
      expect(loadProductSection).to.include('populateProductGroupDatalist');
    });
    
    it('should handle errors gracefully when loading product groups', function() {
      const html = fs.readFileSync(
        path.join(__dirname, '..', 'public', 'admin', 'edit-product.html'),
        'utf-8'
      );
      
      // Check for error handling with try-catch
      const loadProductIndex = html.indexOf('async function loadProduct()');
      const nextFunctionIndex = html.indexOf('function', loadProductIndex + 10);
      const loadProductSection = html.substring(loadProductIndex, nextFunctionIndex);
      
      expect(loadProductSection).to.include('try').and.to.include('catch');
      expect(loadProductSection).to.include('console.warn');
    });
  });
  
  describe('Backend Compatibility', function() {
    it('should have productGroup field in Product schema', function() {
      const productModelPath = path.join(__dirname, '..', 'backend', 'models', 'Product.js');
      const productModel = fs.readFileSync(productModelPath, 'utf-8');
      
      expect(productModel).to.include('productGroup: String');
    });
    
    it('should support productGroup in POST /api/products endpoint', function() {
      const productsRoutePath = path.join(__dirname, '..', 'backend', 'routes', 'products.js');
      const productsRoute = fs.readFileSync(productsRoutePath, 'utf-8');
      
      // Check that productGroup is extracted from body in POST handler
      const postHandlerIndex = productsRoute.indexOf("router.post('/', firebaseAdminAuth");
      const nextRouteIndex = productsRoute.indexOf("router.", postHandlerIndex + 10);
      const postHandlerSection = productsRoute.substring(postHandlerIndex, nextRouteIndex);
      
      expect(postHandlerSection).to.include('productGroup: body.productGroup');
    });
    
    it('should support productGroup in PUT /api/products/:id endpoint', function() {
      const productsRoutePath = path.join(__dirname, '..', 'backend', 'routes', 'products.js');
      const productsRoute = fs.readFileSync(productsRoutePath, 'utf-8');
      
      // Check that productGroup is handled in PUT handler
      const putHandlerIndex = productsRoute.indexOf("router.put('/:id', firebaseAdminAuth");
      const nextRouteIndex = productsRoute.indexOf("router.", putHandlerIndex + 10);
      const putHandlerSection = productsRoute.substring(putHandlerIndex, nextRouteIndex);
      
      expect(putHandlerSection).to.include('body.productGroup').and.to.include('updates.productGroup');
    });
  });
});
