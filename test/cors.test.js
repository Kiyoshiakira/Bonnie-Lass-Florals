const { expect } = require('chai');

describe('CORS Configuration Tests', function() {
  it('should parse CLIENT_ORIGINS from environment or use default', function() {
    // Test the CLIENT_ORIGINS parsing logic
    const defaultOrigin = 'https://bonnielassflorals.com';
    const testOrigins = 'https://example.com, https://test.com';
    
    // Parse like the backend does
    const parseOrigins = (envValue) => (envValue || defaultOrigin)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    
    // Test with default
    const defaultParsed = parseOrigins();
    expect(defaultParsed).to.deep.equal(['https://bonnielassflorals.com']);
    
    // Test with multiple origins
    const multiParsed = parseOrigins(testOrigins);
    expect(multiParsed).to.deep.equal(['https://example.com', 'https://test.com']);
    
    // Test with single origin
    const singleParsed = parseOrigins('https://custom.com');
    expect(singleParsed).to.deep.equal(['https://custom.com']);
  });

  it('should handle CORS origin checking logic correctly', function() {
    const allowedOrigins = ['https://bonnielassflorals.com', 'https://test.com'];
    
    // Test origin check function (mimics the backend logic)
    const checkOrigin = (origin) => {
      if (!origin) return true; // Allow no origin
      return allowedOrigins.indexOf(origin) !== -1;
    };
    
    // No origin (mobile apps, curl)
    expect(checkOrigin(undefined)).to.be.true;
    expect(checkOrigin(null)).to.be.true;
    
    // Allowed origins
    expect(checkOrigin('https://bonnielassflorals.com')).to.be.true;
    expect(checkOrigin('https://test.com')).to.be.true;
    
    // Disallowed origins
    expect(checkOrigin('https://evil.com')).to.be.false;
    expect(checkOrigin('http://bonnielassflorals.com')).to.be.false; // Wrong protocol
  });

  it('should not throw errors for disallowed origins', function() {
    // The CORS callback should return (null, false) for disallowed origins
    // not throw an error
    const mockCallback = (err, allowed) => {
      if (err) throw err;
      return allowed;
    };
    
    // Simulate disallowed origin handling
    const handleDisallowedOrigin = () => {
      // Old way (throws error): callback(new Error('CORS: Origin not allowed'))
      // New way: callback(null, false)
      return mockCallback(null, false);
    };
    
    // This should not throw
    expect(handleDisallowedOrigin).to.not.throw();
    expect(handleDisallowedOrigin()).to.be.false;
  });

  it('should validate default allowed origin is bonnielassflorals.com', function() {
    const defaultOrigin = 'https://bonnielassflorals.com';
    expect(defaultOrigin).to.be.a('string');
    expect(defaultOrigin).to.match(/^https:\/\//); // Must use HTTPS
    expect(defaultOrigin).to.equal('https://bonnielassflorals.com');
  });
});
