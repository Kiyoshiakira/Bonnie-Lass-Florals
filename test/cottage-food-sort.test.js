const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

describe('Cottage Food Sort Options', function() {
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

  it('should have foodSort dropdown with all sort options', function() {
    const foodSort = document.getElementById('foodSort');
    expect(foodSort).to.exist;
    expect(foodSort.tagName).to.equal('SELECT');
    
    // Get all option values
    const options = Array.from(foodSort.options).map(opt => opt.value);
    
    // Verify all expected sort options are present
    expect(options).to.include('default');
    expect(options).to.include('price-low');
    expect(options).to.include('price-high');
    expect(options).to.include('name');
    expect(options).to.include('name-reverse');
    expect(options).to.include('stock-high');
    expect(options).to.include('stock-low');
  });

  it('should have at least 7 sort options for cottage foods', function() {
    const foodSort = document.getElementById('foodSort');
    expect(foodSort).to.exist;
    
    const optionCount = foodSort.options.length;
    expect(optionCount).to.be.at.least(7);
  });

  it('should have name-reverse option with correct label', function() {
    const foodSort = document.getElementById('foodSort');
    const nameReverseOption = Array.from(foodSort.options).find(
      opt => opt.value === 'name-reverse'
    );
    
    expect(nameReverseOption).to.exist;
    expect(nameReverseOption.textContent).to.equal('Name: Z-A');
  });

  it('should have stock-high option with correct label', function() {
    const foodSort = document.getElementById('foodSort');
    const stockHighOption = Array.from(foodSort.options).find(
      opt => opt.value === 'stock-high'
    );
    
    expect(stockHighOption).to.exist;
    expect(stockHighOption.textContent).to.equal('Stock: High to Low');
  });

  it('should have stock-low option with correct label', function() {
    const foodSort = document.getElementById('foodSort');
    const stockLowOption = Array.from(foodSort.options).find(
      opt => opt.value === 'stock-low'
    );
    
    expect(stockLowOption).to.exist;
    expect(stockLowOption.textContent).to.equal('Stock: Low to High');
  });

  it('should call applyFilters function when sort option changes', function() {
    const foodSort = document.getElementById('foodSort');
    expect(foodSort).to.exist;
    
    // Check that onchange attribute is set correctly
    const onchangeAttr = foodSort.getAttribute('onchange');
    expect(onchangeAttr).to.equal("applyFilters('food')");
  });
});
