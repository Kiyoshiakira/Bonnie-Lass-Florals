const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

describe('Input History Feature', function() {
  let dom;
  let window;
  let document;
  let localStorage;

  beforeEach(function() {
    // Create a fresh DOM for each test
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <form>
            <input type="text" id="name" data-history="product_name">
            <textarea id="description" data-history="product_description"></textarea>
            <input type="text" id="subcategory" data-history="product_subcategory">
          </form>
        </body>
      </html>
    `, { 
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable'
    });

    window = dom.window;
    document = window.document;
    localStorage = window.localStorage;

    // Clear localStorage before each test
    localStorage.clear();

    // Load the input-history.js script
    const scriptContent = fs.readFileSync(
      path.join(__dirname, '../public/input-history.js'),
      'utf8'
    );
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);

    // Trigger DOMContentLoaded
    const event = new window.Event('DOMContentLoaded');
    document.dispatchEvent(event);
  });

  afterEach(function() {
    if (dom) {
      dom.window.close();
    }
  });

  it('should expose BLFInputHistory API', function() {
    expect(window.BLFInputHistory).to.exist;
    expect(window.BLFInputHistory.getHistory).to.be.a('function');
    expect(window.BLFInputHistory.pushHistory).to.be.a('function');
    expect(window.BLFInputHistory.storageKey).to.be.a('function');
  });

  it('should generate correct storage keys', function() {
    const key = window.BLFInputHistory.storageKey('product_name');
    expect(key).to.equal('blf:history:product_name');
  });

  it('should save and retrieve history', function() {
    window.BLFInputHistory.pushHistory('product_name', 'Test Product 1');
    window.BLFInputHistory.pushHistory('product_name', 'Test Product 2');
    
    const history = window.BLFInputHistory.getHistory('product_name');
    expect(history).to.be.an('array');
    expect(history).to.have.lengthOf(2);
    expect(history[0]).to.equal('Test Product 2');
    expect(history[1]).to.equal('Test Product 1');
  });

  it('should remove duplicates when pushing to history', function() {
    window.BLFInputHistory.pushHistory('product_name', 'Test Product');
    window.BLFInputHistory.pushHistory('product_name', 'Another Product');
    window.BLFInputHistory.pushHistory('product_name', 'Test Product'); // duplicate
    
    const history = window.BLFInputHistory.getHistory('product_name');
    expect(history).to.have.lengthOf(2);
    expect(history[0]).to.equal('Test Product');
    expect(history[1]).to.equal('Another Product');
  });

  it('should not save empty or whitespace-only values', function() {
    window.BLFInputHistory.pushHistory('product_name', '');
    window.BLFInputHistory.pushHistory('product_name', '   ');
    
    const history = window.BLFInputHistory.getHistory('product_name');
    expect(history).to.have.lengthOf(0);
  });

  it('should add tooltip to fields with data-history', function() {
    const input = document.getElementById('name');
    expect(input.title).to.equal('Use ↑ / ↓ to cycle previous entries');
  });

  it('should handle non-existent history gracefully', function() {
    const history = window.BLFInputHistory.getHistory('non_existent_field');
    expect(history).to.be.an('array');
    expect(history).to.have.lengthOf(0);
  });

  it('should limit history to MAX_ITEMS (30)', function() {
    // Push 35 items
    for (let i = 1; i <= 35; i++) {
      window.BLFInputHistory.pushHistory('product_name', `Product ${i}`);
    }
    
    const history = window.BLFInputHistory.getHistory('product_name');
    expect(history).to.have.lengthOf(30);
    expect(history[0]).to.equal('Product 35');
    expect(history[29]).to.equal('Product 6');
  });

  it('should store history in localStorage with correct key', function() {
    window.BLFInputHistory.pushHistory('product_name', 'Test Product');
    
    const storedValue = localStorage.getItem('blf:history:product_name');
    expect(storedValue).to.exist;
    
    const parsed = JSON.parse(storedValue);
    expect(parsed).to.be.an('array');
    expect(parsed[0]).to.equal('Test Product');
  });
});
