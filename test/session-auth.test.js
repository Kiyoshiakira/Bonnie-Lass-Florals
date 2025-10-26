const { expect } = require('chai');

describe('Session and Auth Configuration', function() {
  // Give these tests more time because initializing Firebase Admin can be slow
  this.timeout(10000);

describe('Session and Auth Configuration', function() {
  describe('Firebase Admin Initialization', function() {
    it('should initialize Firebase Admin without error', function() {
      // This will throw if initialization fails
      const admin = require('../backend/utils/firebaseAdmin');
      expect(admin).to.exist;
      expect(admin.apps).to.have.length.greaterThan(0);
    });

    it('should export the admin instance', function() {
      const admin = require('../backend/utils/firebaseAdmin');
      expect(admin.auth).to.be.a('function');
      expect(admin.credential).to.exist;
    });
  });

  describe('Auth Middleware', function() {
    it('should export a function', function() {
      const auth = require('../backend/middleware/auth');
      expect(auth).to.be.a('function');
    });
  });

  describe('Firebase Admin Auth Middleware', function() {
    it('should export a function', function() {
      const firebaseAdminAuth = require('../backend/middleware/firebaseAdminAuth');
      expect(firebaseAdminAuth).to.be.a('function');
    });
  });

  describe('Admin Utilities', function() {
    it('should check admin emails correctly', function() {
      const { isAdminEmail } = require('../backend/config/admins');
      
      // Test valid admin email
      expect(isAdminEmail('shaunessy24@gmail.com')).to.be.true;
      expect(isAdminEmail('bonnielassflorals@gmail.com')).to.be.true;
      
      // Test case insensitivity
      expect(isAdminEmail('SHAUNESSY24@GMAIL.COM')).to.be.true;
      
      // Test non-admin email
      expect(isAdminEmail('random@example.com')).to.be.false;
      
      // Test invalid inputs
      expect(isAdminEmail(null)).to.be.false;
      expect(isAdminEmail(undefined)).to.be.false;
      expect(isAdminEmail('')).to.be.false;
    });
  });
});
