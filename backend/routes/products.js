const express = require('express');
const router = express.Router();
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const firebaseAdminAuth = require('../middleware/firebaseAdminAuth'); // admin-only middleware
const { distance } = require('fastest-levenshtein');
const logger = require('../utils/logger');
const { normalizeImageUrl, normalizeProduct } = require('../utils/media');

// Ensure upload directory exists and is writable
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'admin', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + safeName);
  }
});
const upload = multer({ storage });

// Stricter rate limiter for admin mutating endpoints (10 requests per minute)
const adminMutationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many admin requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper function to calculate string similarity (0 to 1, where 1 is identical)
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  // Normalize strings for comparison (lowercase, trim whitespace)
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  // Use Levenshtein distance to calculate similarity
  const maxLength = Math.max(s1.length, s2.length);
  const dist = distance(s1, s2);
  const similarity = 1 - (dist / maxLength);
  
  return similarity;
}

// Helper function to check if a product is a duplicate of an existing product
function isDuplicateProduct(newProduct, existingProduct) {
  // Calculate similarity scores
  const nameSimilarity = calculateSimilarity(newProduct.name, existingProduct.name);
  const descSimilarity = calculateSimilarity(newProduct.description, existingProduct.description);
  
  // Check for key differentiators (colors, sizes, types) in the name
  const colorWords = ['red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'white', 'black', 'brown', 'tan', 'gray', 'grey'];
  const sizeWords = ['small', 'medium', 'large', 'mini', 'tiny', 'huge', 'giant'];
  const name1Lower = newProduct.name.toLowerCase();
  const name2Lower = existingProduct.name.toLowerCase();
  
  // Check if both names have different colors or sizes
  for (const color of colorWords) {
    const name1HasColor = name1Lower.includes(color);
    const name2HasColor = name2Lower.includes(color);
    if (name1HasColor !== name2HasColor) {
      // One has a color word, the other doesn't - likely different
      return false;
    }
    if (name1HasColor && name2HasColor) {
      // Check if they mention the SAME color
      const name1Colors = colorWords.filter(c => name1Lower.includes(c));
      const name2Colors = colorWords.filter(c => name2Lower.includes(c));
      if (name1Colors.length > 0 && name2Colors.length > 0) {
        const hasSameColor = name1Colors.some(c => name2Colors.includes(c));
        if (!hasSameColor) {
          // Different colors mentioned - likely different products
          return false;
        }
      }
    }
  }
  
  // Consider it a duplicate if:
  // 1. Name is very similar (>= 0.90) - likely same product even if description changed
  // 2. OR both name and description are quite similar (name >= 0.65 AND desc >= 0.85) - same product with minor edits
  // 3. OR description is very similar with moderate name match (name >= 0.60 AND desc >= 0.92)
  const isNameMatch = nameSimilarity >= 0.90;
  const isBothMatch = nameSimilarity >= 0.65 && descSimilarity >= 0.85;
  const isDescStrongMatch = nameSimilarity >= 0.60 && descSimilarity >= 0.92;
  
  return isNameMatch || isBothMatch || isDescStrongMatch;
}

// GET /api/products - list all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    // Normalize image URLs to absolute URLs for all products
    const normalizedProducts = products.map(p => normalizeProduct(p));
    res.json(normalizedProducts);
  } catch (err) {
    logger.error('GET /api/products error', err);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// GET /api/products/:id - get single product
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    // Normalize image URL to absolute URL
    res.json(normalizeProduct(product));
  } catch (err) {
    logger.error('GET /api/products/:id error', err);
    res.status(500).json({ error: 'Failed to load product' });
  }
});

// Validation rules for creating a product
const createProductValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 200 }).withMessage('Name must be 200 characters or less'),
  body('description')
    .optional()
    .isLength({ max: 2000 }).withMessage('Description must be 2000 characters or less'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a number greater than or equal to 0'),
  body('type')
    .optional()
    .isIn(['decor', 'food']).withMessage('Type must be either "decor" or "food"'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('options')
    .optional()
    .custom((value) => {
      if (typeof value === 'string' || Array.isArray(value)) {
        return true;
      }
      throw new Error('Options must be a string or array');
    })
];

// POST /api/products - create product (admin only)
// Accepts multipart/form-data (image file optional) or JSON
router.post('/', firebaseAdminAuth, adminMutationLimiter, createProductValidation, upload.single('image'), async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const body = req.body || {};
    const productData = {
      name: body.name,
      description: body.description,
      price: body.price ? parseFloat(body.price) : 0,
      type: body.type || 'decor',
      subcategory: body.subcategory || '',
      stock: body.stock ? parseInt(body.stock, 10) : 1,
      options: body.options
        ? (Array.isArray(body.options) ? body.options : String(body.options).split(',').map(s => s.trim()).filter(Boolean))
        : [],
      featured: body.featured === 'true' || body.featured === true,
      collection: body.collection || '',
      occasion: body.occasion || ''
    };

    if (req.file) {
      // Store relative path in DB for portability
      productData.image = `/admin/uploads/${req.file.filename}`;
    } else if (body.image) {
      productData.image = body.image;
    } else {
      productData.image = '';
    }

    const product = new Product(productData);
    await product.save();
    // Return normalized product with absolute image URL
    res.status(201).json(normalizeProduct(product));
  } catch (err) {
    logger.error('POST /api/products error', err);
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

// Validation rules for batch product creation
const batchProductValidation = [
  body('products')
    .notEmpty().withMessage('Products array is required')
    .isArray().withMessage('Products must be an array')
    .custom((products) => {
      if (products.length === 0) {
        throw new Error('Products array cannot be empty');
      }
      if (products.length > 100) {
        throw new Error('Batch size limited to 100 products');
      }
      // Validate each product has name and numeric price
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (!product.name) {
          throw new Error(`Product at index ${i} is missing required field: name`);
        }
        if (product.price === undefined || product.price === null) {
          throw new Error(`Product at index ${i} is missing required field: price`);
        }
        // Check if price can be converted to a valid number
        const priceNum = parseFloat(product.price);
        if (isNaN(priceNum)) {
          throw new Error(`Product at index ${i} has invalid price: must be numeric`);
        }
        if (priceNum < 0) {
          throw new Error(`Product at index ${i} has invalid price: must be >= 0`);
        }
      }
      return true;
    })
];

// POST /api/products/batch - batch create products (admin only)
// Accepts JSON array of product objects
router.post('/batch', firebaseAdminAuth, adminMutationLimiter, batchProductValidation, async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { products } = req.body;
    
    // Fetch all existing products for duplicate checking
    const existingProducts = await Product.find();
    
    const results = {
      success: [],
      errors: [],
      skipped: [] // Track products skipped due to duplicates
    };
    
    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      
      try {
        // Validate required fields
        if (!productData.name || !productData.price) {
          results.errors.push({
            row: i + 1,
            error: 'Missing required fields: name and price are required'
          });
          continue;
        }
        
        const newProduct = {
          name: productData.name,
          description: productData.description || '',
          price: parseFloat(productData.price) || 0,
          type: productData.type || 'decor',
          subcategory: productData.subcategory || '',
          stock: productData.stock ? parseInt(productData.stock, 10) : 1,
          options: productData.options
            ? (Array.isArray(productData.options) ? productData.options : String(productData.options).split(',').map(s => s.trim()).filter(Boolean))
            : [],
          image: productData.image || '',
          featured: productData.featured === 'true' || productData.featured === true || false,
          collection: productData.collection || '',
          occasion: productData.occasion || ''
        };
        
        // Check for duplicates against existing products
        let foundDuplicate = false;
        let duplicateProductName = '';
        
        for (const existingProduct of existingProducts) {
          if (isDuplicateProduct(newProduct, existingProduct)) {
            foundDuplicate = true;
            duplicateProductName = existingProduct.name;
            break;
          }
        }
        
        if (foundDuplicate) {
          // Skip this product as it's a duplicate
          results.skipped.push({
            row: i + 1,
            name: newProduct.name,
            duplicateOf: duplicateProductName,
            reason: 'Similar product already exists'
          });
          continue;
        }
        
        const product = new Product(newProduct);
        await product.save();
        
        // Add to existing products list for checking against subsequent items in this batch
        existingProducts.push(product);
        
        results.success.push({
          name: product.name,
          id: product._id
        });
      } catch (err) {
        results.errors.push({
          row: i + 1,
          error: err.message || 'Failed to create product'
        });
      }
    }
    
    res.status(201).json({
      message: `Batch upload completed: ${results.success.length} added, ${results.skipped.length} skipped (duplicates), ${results.errors.length} failed`,
      results
    });
  } catch (err) {
    logger.error('POST /api/products/batch error', err);
    res.status(500).json({ error: err.message || 'Batch upload failed' });
  }
});

// Validation rules for updating a product
const updateProductValidation = [
  body('name')
    .optional()
    .isLength({ max: 200 }).withMessage('Name must be 200 characters or less'),
  body('description')
    .optional()
    .isLength({ max: 2000 }).withMessage('Description must be 2000 characters or less'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a number greater than or equal to 0'),
  body('type')
    .optional()
    .isIn(['decor', 'food']).withMessage('Type must be either "decor" or "food"'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('options')
    .optional()
    .custom((value) => {
      if (typeof value === 'string' || Array.isArray(value)) {
        return true;
      }
      throw new Error('Options must be a string or array');
    })
];

// PUT /api/products/:id - update product (admin only)
// Accepts multipart/form-data (image file optional) or JSON body
router.put('/:id', firebaseAdminAuth, adminMutationLimiter, updateProductValidation, upload.single('image'), async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const id = req.params.id;
    const body = req.body || {};

    // Build updates from either JSON or form fields
    const updates = {};
    if (typeof body.name !== 'undefined') updates.name = body.name;
    if (typeof body.description !== 'undefined') updates.description = body.description;
    if (typeof body.price !== 'undefined' && body.price !== '') updates.price = parseFloat(body.price);
    if (typeof body.type !== 'undefined') updates.type = body.type;
    if (typeof body.subcategory !== 'undefined') updates.subcategory = body.subcategory;
    if (typeof body.stock !== 'undefined' && body.stock !== '') updates.stock = parseInt(body.stock, 10);
    if (typeof body.options !== 'undefined') {
      updates.options = Array.isArray(body.options)
        ? body.options
        : String(body.options).split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof body.featured !== 'undefined') {
      updates.featured = (body.featured === 'true' || body.featured === true);
    }
    if (typeof body.collection !== 'undefined') updates.collection = body.collection;
    if (typeof body.occasion !== 'undefined') updates.occasion = body.occasion;

    // If an image file was uploaded via multipart/form-data, set image path (relative for DB)
    if (req.file) {
      updates.image = `/admin/uploads/${req.file.filename}`;
    } else if (body.image) {
      // allow explicit image URL in JSON body
      updates.image = body.image;
    }

    // Update document
    const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    // Return normalized product with absolute image URL
    res.json(normalizeProduct(product));
  } catch (err) {
    logger.error('PUT /api/products/:id error', err);
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

// DELETE /api/products/:id - delete product (admin only)
router.delete('/:id', firebaseAdminAuth, adminMutationLimiter, async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    // Optionally: remove uploaded file from disk if present
    if (product.image && product.image.startsWith('/admin/uploads/')) {
      try {
        const fname = product.image.replace('/admin/uploads/', '');
        const full = path.join(UPLOAD_DIR, fname);
        if (fs.existsSync(full)) fs.unlinkSync(full);
      } catch (e) {
        logger.warn('Failed to remove product image file:', e);
      }
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    logger.error('DELETE /api/products/:id error', err);
    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
});

module.exports = router;
