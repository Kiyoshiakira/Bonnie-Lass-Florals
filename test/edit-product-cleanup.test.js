const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

describe('Edit Product Page Cleanup', function() {
  let dom;
  let window;
  let document;
  let htmlContent;

  beforeEach(function() {
    // Load the edit-product.html content
    const editProductPath = path.join(__dirname, '../public/admin/edit-product.html');
    htmlContent = fs.readFileSync(editProductPath, 'utf8');
    
    dom = new JSDOM(htmlContent, { 
      url: 'http://localhost',
      runScripts: 'dangerously'
    });

    window = dom.window;
    document = window.document;
  });

  describe('Code Cleanup', function() {
    it('should not contain duplicate profile dropdown code', function() {
      // Check that the old duplicate profile dropdown code is removed
      expect(htmlContent).to.not.include('profileImg && profileImg.addEventListener');
      expect(htmlContent).to.include('Profile dropdown and auth handled by auth.js');
    });

    it('should not contain duplicate auth state listener', function() {
      // The file should not have its own onAuthStateChanged handler
      // since that's handled by auth.js
      const scriptSection = htmlContent.substring(htmlContent.indexOf('<script>'));
      const authStateListenerPattern = /firebase\.auth\(\)\.onAuthStateChanged\(/;
      expect(authStateListenerPattern.test(scriptSection)).to.be.false;
    });

    it('should not have deprecated breadcrumb CSS classes', function() {
      // Old breadcrumb-specific CSS should be removed
      expect(htmlContent).to.not.include('class="breadcrumb"');
      expect(htmlContent).to.not.include('.breadcrumb {');
      expect(htmlContent).to.not.include('.breadcrumb-sep {');
    });

    it('should use improved HTML escaping utilities', function() {
      // Check for the safer DOM-based escaping method
      expect(htmlContent).to.include('div.textContent = String(s)');
      expect(htmlContent).to.include('div.innerHTML');
    });
  });

  describe('Image Management Features', function() {
    it('should have image preview controls CSS', function() {
      expect(htmlContent).to.include('.image-preview-controls {');
      expect(htmlContent).to.include('opacity:0;');
      expect(htmlContent).to.include('.image-preview-item:hover .image-preview-controls');
    });

    it('should have moveImage function', function() {
      expect(htmlContent).to.include('function moveImage(index, direction)');
    });

    it('should have deleteImage function', function() {
      expect(htmlContent).to.include('function deleteImage(index)');
    });

    it('should include image management controls in preview HTML', function() {
      expect(htmlContent).to.include('onclick="moveImage');
      expect(htmlContent).to.include('onclick="deleteImage');
      expect(htmlContent).to.include('title="Move left"');
      expect(htmlContent).to.include('title="Move right"');
      expect(htmlContent).to.include('title="Delete"');
    });

    it('should have updated help text for image management', function() {
      expect(htmlContent).to.include('Hover over images to reorder or delete them');
    });
  });

  describe('Consistent Styling', function() {
    it('should use inline breadcrumb styling like upload.html', function() {
      // Should use inline style breadcrumbs
      expect(htmlContent).to.include('font-size:0.95rem;color:#666;margin-bottom:0.75rem');
      expect(htmlContent).to.include('color:#6e33b7;text-decoration:none');
    });

    it('should have consistent button classes', function() {
      expect(htmlContent).to.include('class="btn btn-primary"');
      expect(htmlContent).to.include('class="btn btn-secondary"');
      expect(htmlContent).to.include('class="btn btn-danger"');
      expect(htmlContent).to.include('class="btn btn-outline"');
    });
  });

  describe('Core Functionality', function() {
    it('should have all required form fields', function() {
      const nameInput = document.getElementById('name');
      const descInput = document.getElementById('description');
      const priceInput = document.getElementById('price');
      const stockInput = document.getElementById('stock');
      const typeSelect = document.getElementById('type');

      expect(nameInput).to.exist;
      expect(descInput).to.exist;
      expect(priceInput).to.exist;
      expect(stockInput).to.exist;
      expect(typeSelect).to.exist;

      expect(nameInput.required).to.be.true;
      expect(descInput.required).to.be.true;
      expect(priceInput.required).to.be.true;
      expect(stockInput.required).to.be.true;
    });

    it('should have image upload fields', function() {
      const imageUrls = document.getElementById('imageUrls');
      const imageFiles = document.getElementById('imageFiles');

      expect(imageUrls).to.exist;
      expect(imageFiles).to.exist;
      expect(imageFiles.type).to.equal('file');
      expect(imageFiles.multiple).to.be.true;
    });

    it('should have extended details fields', function() {
      const ingredients = document.getElementById('ingredients');
      const allergens = document.getElementById('allergens');
      const nutritionalInfo = document.getElementById('nutritionalInfo');
      const recipe = document.getElementById('recipe');
      const careInstructions = document.getElementById('careInstructions');

      expect(ingredients).to.exist;
      expect(allergens).to.exist;
      expect(nutritionalInfo).to.exist;
      expect(recipe).to.exist;
      expect(careInstructions).to.exist;
    });

    it('should have action buttons', function() {
      const saveBtn = document.getElementById('saveBtn');
      const cancelBtn = document.getElementById('cancelBtn');
      const deleteBtn = document.getElementById('deleteBtn');
      const duplicateBtn = document.getElementById('duplicateBtn');

      expect(saveBtn).to.exist;
      expect(cancelBtn).to.exist;
      expect(deleteBtn).to.exist;
      expect(duplicateBtn).to.exist;
    });

    it('should have message display elements', function() {
      const loadingMessage = document.getElementById('loadingMessage');
      const errorMessage = document.getElementById('errorMessage');
      const successMessage = document.getElementById('successMessage');

      expect(loadingMessage).to.exist;
      expect(errorMessage).to.exist;
      expect(successMessage).to.exist;
    });
  });

  describe('Security and XSS Prevention', function() {
    it('should use safe HTML escaping', function() {
      // Should use DOM-based escaping which is safer
      expect(htmlContent).to.include('div.textContent = String(s)');
    });

    it('should escape attributes in image preview', function() {
      expect(htmlContent).to.include('escapeAttr(img)');
    });
  });
});
