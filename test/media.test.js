const { expect } = require('chai');
const { normalizeImageUrl, normalizeProduct } = require('../backend/utils/media');

describe('Media Utils - Image URL Normalization', function() {
  // Save original env
  const originalBackendUrl = process.env.BACKEND_URL;
  
  afterEach(function() {
    // Restore original env after each test
    process.env.BACKEND_URL = originalBackendUrl;
  });

  describe('normalizeImageUrl()', function() {
    it('should return empty string for null or undefined', function() {
      expect(normalizeImageUrl(null)).to.equal('');
      expect(normalizeImageUrl(undefined)).to.equal('');
      expect(normalizeImageUrl('')).to.equal('');
    });

    it('should return Firebase Storage URLs unchanged', function() {
      const firebaseUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image.jpg';
      expect(normalizeImageUrl(firebaseUrl)).to.equal(firebaseUrl);
    });

    it('should return absolute HTTP URLs unchanged', function() {
      const httpUrl = 'http://example.com/image.jpg';
      expect(normalizeImageUrl(httpUrl)).to.equal(httpUrl);
    });

    it('should return absolute HTTPS URLs unchanged', function() {
      const httpsUrl = 'https://example.com/image.jpg';
      expect(normalizeImageUrl(httpsUrl)).to.equal(httpsUrl);
    });

    it('should handle relative paths when BACKEND_URL is not set', function() {
      delete process.env.BACKEND_URL;
      expect(normalizeImageUrl('/admin/uploads/image.jpg')).to.equal('/admin/uploads/image.jpg');
      expect(normalizeImageUrl('admin/uploads/image.jpg')).to.equal('/admin/uploads/image.jpg');
    });

    it('should convert relative paths to absolute URLs when BACKEND_URL is set', function() {
      process.env.BACKEND_URL = 'https://bonnie-lass-florals.onrender.com';
      expect(normalizeImageUrl('/admin/uploads/image.jpg'))
        .to.equal('https://bonnie-lass-florals.onrender.com/admin/uploads/image.jpg');
      expect(normalizeImageUrl('admin/uploads/image.jpg'))
        .to.equal('https://bonnie-lass-florals.onrender.com/admin/uploads/image.jpg');
    });

    it('should prioritize Firebase Storage URLs over BACKEND_URL', function() {
      process.env.BACKEND_URL = 'https://bonnie-lass-florals.onrender.com';
      const firebaseUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image.jpg';
      expect(normalizeImageUrl(firebaseUrl)).to.equal(firebaseUrl);
    });
  });

  describe('normalizeProduct()', function() {
    it('should normalize product with Firebase Storage URL', function() {
      const product = {
        _id: '123',
        name: 'Test Product',
        image: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/image.jpg',
        price: 25.99
      };
      
      const normalized = normalizeProduct(product);
      expect(normalized.image).to.equal('https://firebasestorage.googleapis.com/v0/b/bucket/o/image.jpg');
    });

    it('should normalize product with relative path', function() {
      process.env.BACKEND_URL = 'https://bonnie-lass-florals.onrender.com';
      const product = {
        _id: '123',
        name: 'Test Product',
        image: '/admin/uploads/image.jpg',
        price: 25.99
      };
      
      const normalized = normalizeProduct(product);
      expect(normalized.image).to.equal('https://bonnie-lass-florals.onrender.com/admin/uploads/image.jpg');
    });

    it('should handle product with no image', function() {
      const product = {
        _id: '123',
        name: 'Test Product',
        image: '',
        price: 25.99
      };
      
      const normalized = normalizeProduct(product);
      expect(normalized.image).to.equal('');
    });

    it('should handle Mongoose document with toObject method', function() {
      process.env.BACKEND_URL = 'https://bonnie-lass-florals.onrender.com';
      const mockDocument = {
        _id: '123',
        name: 'Test Product',
        image: '/admin/uploads/image.jpg',
        price: 25.99,
        toObject: function() {
          return {
            _id: this._id,
            name: this.name,
            image: this.image,
            price: this.price
          };
        }
      };
      
      const normalized = normalizeProduct(mockDocument);
      expect(normalized.image).to.equal('https://bonnie-lass-florals.onrender.com/admin/uploads/image.jpg');
    });
  });
});
