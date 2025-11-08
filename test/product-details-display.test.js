const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

describe('Product Details Display', function() {
  let dom;
  let window;
  let document;
  let shopJs;

  before(function() {
    // Read the shop.js file content
    const shopJsPath = path.join(__dirname, '../public/shop.js');
    shopJs = fs.readFileSync(shopJsPath, 'utf8');
  });

  it('should not filter extended details based on product type (food vs decor)', function() {
    // Test that the showProductDetails function doesn't use type-based filtering
    // Previously, it used isFood and isCraft variables to filter which fields to show
    // Now it should show all populated fields regardless of type
    
    expect(shopJs).to.not.include('const isFood = product.type ===');
    expect(shopJs).to.not.include('const isCraft = product.type ===');
    expect(shopJs).to.not.include('if (isFood) {');
    expect(shopJs).to.not.include('if (isCraft) {');
  });

  it('should always display all extended details fields', function() {
    // Verify that all extended details fields are always shown
    // Fields should use fallback values like 'None' or 'N/A' when empty
    
    const extendedDetailsFields = [
      'ingredients',
      'allergens',
      'nutritionalInfo',
      'materials',
      'dimensions',
      'weight',
      'careInstructions',
      'recipe',
      'storageInstructions',
      'expirationInfo',
      'additionalNotes'
    ];

    // Each field should have a fallback value using OR operator
    extendedDetailsFields.forEach(field => {
      const pattern = `details.${field} || `;
      expect(shopJs).to.include(pattern, `Should have fallback for ${field} field`);
    });
  });

  it('should use appropriate fallback values for empty fields', function() {
    // Verify that 'None' is used for textarea fields and 'N/A' for text fields
    // Textarea fields should use 'None'
    const textareaFields = ['ingredients', 'nutritionalInfo', 'careInstructions', 'recipe', 'storageInstructions', 'additionalNotes'];
    textareaFields.forEach(field => {
      const content = field.charAt(0).toUpperCase() + field.slice(1);
      expect(shopJs).to.include(`details.${field} || 'None'`, `Should use 'None' for ${field}`);
    });
    
    // Text fields should use 'N/A'
    const textFields = ['allergens', 'materials', 'dimensions', 'weight', 'expirationInfo'];
    textFields.forEach(field => {
      expect(shopJs).to.include(`details.${field} || 'N/A'`, `Should use 'N/A' for ${field}`);
    });
  });

  it('should have a comment indicating all fields are always shown', function() {
    // Verify the comment that explains the new behavior
    expect(shopJs).to.include('Show all extended details fields (always visible');
  });

  it('should maintain proper HTML structure in showProductDetails function', function() {
    // Ensure the function still creates proper HTML sections
    expect(shopJs).to.include('function showProductDetails(productId)');
    expect(shopJs).to.include('createCollapsibleSection');
    expect(shopJs).to.include('detail-section');
    expect(shopJs).to.include('productDetailsModal');
  });

  it('should properly escape user input in details display', function() {
    // Ensure all user-provided content is escaped
    // Now fields use fallback values, so we check for the pattern with OR operator
    const fieldsWithEscaping = [
      'escapeHtml(product.name)',
      'escapeHtml(product.description)',
      'escapeHtml(details.ingredients || \'None\')',
      'escapeHtml(details.allergens || \'N/A\')',
      'escapeHtml(details.nutritionalInfo || \'None\')',
      'escapeHtml(details.materials || \'N/A\')',
      'escapeHtml(details.dimensions || \'N/A\')',
      'escapeHtml(details.weight || \'N/A\')',
      'escapeHtml(details.careInstructions || \'None\')',
      'escapeHtml(details.recipe || \'None\')',
      'escapeHtml(details.storageInstructions || \'None\')',
      'escapeHtml(details.expirationInfo || \'N/A\')',
      'escapeHtml(details.additionalNotes || \'None\')'
    ];

    fieldsWithEscaping.forEach(escapedField => {
      expect(shopJs).to.include(escapedField, `Should escape ${escapedField}`);
    });
  });
});
