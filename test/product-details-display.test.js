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

  it('should display all extended details fields when populated', function() {
    // Verify that all extended details fields are checked with simple if statements
    // not wrapped in type-based conditionals
    
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

    // Each field should have a direct check like: if (details.fieldName)
    extendedDetailsFields.forEach(field => {
      const pattern = `if (details.${field})`;
      expect(shopJs).to.include(pattern, `Should check for ${field} field`);
    });
  });

  it('should have a comment indicating type-agnostic display', function() {
    // Verify the comment that explains the new behavior
    expect(shopJs).to.include('Show all extended details if they are populated (regardless of product type)');
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
    const fieldsWithEscaping = [
      'escapeHtml(product.name)',
      'escapeHtml(product.description)',
      'escapeHtml(details.ingredients)',
      'escapeHtml(details.allergens)',
      'escapeHtml(details.nutritionalInfo)',
      'escapeHtml(details.materials)',
      'escapeHtml(details.dimensions)',
      'escapeHtml(details.weight)',
      'escapeHtml(details.careInstructions)',
      'escapeHtml(details.recipe)',
      'escapeHtml(details.storageInstructions)',
      'escapeHtml(details.expirationInfo)',
      'escapeHtml(details.additionalNotes)'
    ];

    fieldsWithEscaping.forEach(escapedField => {
      expect(shopJs).to.include(escapedField, `Should escape ${escapedField}`);
    });
  });
});
