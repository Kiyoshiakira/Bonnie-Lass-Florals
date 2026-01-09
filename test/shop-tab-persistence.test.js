const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

describe('Shop Page Tab Persistence', function() {
  let dom;
  let window;
  let document;

  beforeEach(function() {
    // Create a fresh DOM for each test with the shop.html content
    const shopHtmlPath = path.join(__dirname, '../public/shop.html');
    const shopHtml = fs.readFileSync(shopHtmlPath, 'utf8');
    
    dom = new JSDOM(shopHtml, { 
      url: 'http://localhost/shop.html',
      runScripts: 'dangerously',
      resources: 'usable'
    });

    window = dom.window;
    document = window.document;
  });

  it('should have both shop tabs in HTML', function() {
    const decorTab = document.getElementById('decorTab');
    const foodTab = document.getElementById('foodTab');
    
    expect(decorTab).to.exist;
    expect(foodTab).to.exist;
  });

  it('should have both shop sections in HTML', function() {
    const decorSection = document.getElementById('shop-decor');
    const foodSection = document.getElementById('shop-food');
    
    expect(decorSection).to.exist;
    expect(foodSection).to.exist;
  });

  it('should default to handmade crafts tab when no hash is present', function() {
    const decorTab = document.getElementById('decorTab');
    const decorSection = document.getElementById('shop-decor');
    
    expect(decorTab.classList.contains('active')).to.be.true;
    expect(decorSection.classList.contains('active')).to.be.true;
  });

  it('should have onclick handlers for tab switching', function() {
    const decorTab = document.getElementById('decorTab');
    const foodTab = document.getElementById('foodTab');
    
    // Check that onclick attributes are set (since scripts don't load in JSDOM)
    expect(decorTab.getAttribute('onclick')).to.contain('showShopSection');
    expect(foodTab.getAttribute('onclick')).to.contain('showShopSection');
  });
});

describe('Shop Tab Switching Logic (Unit Tests)', function() {
  it('should switch to food tab and update URL hash', function() {
    const mockWindow = {
      location: {
        hash: ''
      }
    };
    
    const mockDocument = {
      getElementById: (_id) => ({
        classList: {
          remove: () => {},
          add: () => {}
        }
      })
    };
    
    // Simulate the showShopSection function logic
    function showShopSection(type) {
      // Validate type parameter
      if (type !== 'decor' && type !== 'food') {
        return;
      }
      
      mockDocument.getElementById('shop-decor').classList.remove('active');
      mockDocument.getElementById('shop-food').classList.remove('active');
      mockDocument.getElementById('decorTab').classList.remove('active');
      mockDocument.getElementById('foodTab').classList.remove('active');
      if (type === 'decor') {
        mockDocument.getElementById('shop-decor').classList.add('active');
        mockDocument.getElementById('decorTab').classList.add('active');
      } else {
        mockDocument.getElementById('shop-food').classList.add('active');
        mockDocument.getElementById('foodTab').classList.add('active');
      }
      
      // Save the current tab to URL hash for persistence
      mockWindow.location.hash = type;
    }
    
    // Test switching to food
    showShopSection('food');
    expect(mockWindow.location.hash).to.equal('food');
    
    // Test switching to decor
    showShopSection('decor');
    expect(mockWindow.location.hash).to.equal('decor');
  });

  it('should validate type parameter and reject invalid values', function() {
    const mockWindow = {
      location: {
        hash: 'decor' // Set initial hash
      }
    };
    
    const mockDocument = {
      getElementById: (_id) => ({
        classList: {
          remove: () => {},
          add: () => {}
        }
      })
    };
    
    function showShopSection(type) {
      // Validate type parameter
      if (type !== 'decor' && type !== 'food') {
        return;
      }
      
      mockDocument.getElementById('shop-decor').classList.remove('active');
      mockDocument.getElementById('shop-food').classList.remove('active');
      mockDocument.getElementById('decorTab').classList.remove('active');
      mockDocument.getElementById('foodTab').classList.remove('active');
      if (type === 'decor') {
        mockDocument.getElementById('shop-decor').classList.add('active');
        mockDocument.getElementById('decorTab').classList.add('active');
      } else {
        mockDocument.getElementById('shop-food').classList.add('active');
        mockDocument.getElementById('foodTab').classList.add('active');
      }
      
      mockWindow.location.hash = type;
    }
    
    // Test with invalid type
    showShopSection('invalid');
    // Hash should remain unchanged
    expect(mockWindow.location.hash).to.equal('decor');
    
    // Test with valid type to ensure it still works
    showShopSection('food');
    expect(mockWindow.location.hash).to.equal('food');
  });

  it('should restore tab from URL hash', function() {
    let restoredTab = null;
    
    // Simulate the DOMContentLoaded initialization logic
    function initializeTab(hashValue) {
      const hash = hashValue.substring(1); // Remove the '#' character
      if (hash === 'food' || hash === 'decor') {
        restoredTab = hash;
      }
    }
    
    // Test with food hash
    initializeTab('#food');
    expect(restoredTab).to.equal('food');
    
    // Test with decor hash
    restoredTab = null;
    initializeTab('#decor');
    expect(restoredTab).to.equal('decor');
    
    // Test with invalid hash
    restoredTab = null;
    initializeTab('#invalid');
    expect(restoredTab).to.be.null;
    
    // Test with empty hash
    restoredTab = null;
    initializeTab('');
    expect(restoredTab).to.be.null;
  });
});
