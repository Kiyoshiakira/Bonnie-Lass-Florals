const { expect } = require('chai');

describe('Basic Tests', function() {
  it('should pass a simple assertion', function() {
    expect(true).to.be.true;
  });

  it('should perform basic arithmetic', function() {
    const sum = 2 + 2;
    expect(sum).to.equal(4);
  });

  it('should check Node.js environment', function() {
    expect(process.version).to.match(/^v\d+\.\d+\.\d+$/);
  });
});
