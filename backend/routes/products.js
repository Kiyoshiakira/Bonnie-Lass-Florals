const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const firebaseAdminAuth = require('../middleware/firebaseAdminAuth'); // admin-only middleware

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

// Helper function to normalize image URLs to absolute URLs
// Stores relative paths in DB but returns absolute URLs to clients
const BACKEND_URL = process.env.BACKEND_URL || 'https://bonnie-lass-florals.onrender.com';
function normalizeImageUrl(image) {
  if (!image) return '';
  // If already an absolute URL, return as-is
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  // Convert relative path to absolute URL
  if (image.startsWith('/')) {
    return BACKEND_URL + image;
  }
  return BACKEND_URL + '/' + image;
}

// Helper function to normalize a product object
function normalizeProduct(product) {
  const normalized = product.toObject ? product.toObject() : { ...product };
  normalized.image = normalizeImageUrl(normalized.image);
  return normalized;
}

// GET /api/products - list all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    // Normalize image URLs to absolute URLs for all products
    const normalizedProducts = products.map(p => normalizeProduct(p));
    res.json(normalizedProducts);
  } catch (err) {
    console.error('GET /api/products error', err);
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
    console.error('GET /api/products/:id error', err);
    res.status(500).json({ error: 'Failed to load product' });
  }
});

// POST /api/products - create product (admin only)
// Accepts multipart/form-data (image file optional) or JSON
router.post('/', firebaseAdminAuth, upload.single('image'), async (req, res) => {
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
      featured: body.featured === 'true' || body.featured === true
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
    console.error('POST /api/products error', err);
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

// POST /api/products/batch - batch create products (admin only)
// Accepts JSON array of product objects
router.post('/batch', firebaseAdminAuth, async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'Request body must contain a "products" array' });
    }
    
    if (products.length === 0) {
      return res.status(400).json({ error: 'Products array cannot be empty' });
    }
    
    if (products.length > 100) {
      return res.status(400).json({ error: 'Batch size limited to 100 products' });
    }
    
    const results = {
      success: [],
      errors: []
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
          featured: productData.featured === 'true' || productData.featured === true || false
        };
        
        const product = new Product(newProduct);
        await product.save();
        
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
      message: `Batch upload completed: ${results.success.length} succeeded, ${results.errors.length} failed`,
      results
    });
  } catch (err) {
    console.error('POST /api/products/batch error', err);
    res.status(500).json({ error: err.message || 'Batch upload failed' });
  }
});

// PUT /api/products/:id - update product (admin only)
// Accepts multipart/form-data (image file optional) or JSON body
router.put('/:id', firebaseAdminAuth, upload.single('image'), async (req, res) => {
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
    console.error('PUT /api/products/:id error', err);
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

// DELETE /api/products/:id - delete product (admin only)
router.delete('/:id', firebaseAdminAuth, async (req, res) => {
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
        console.warn('Failed to remove product image file:', e);
      }
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('DELETE /api/products/:id error', err);
    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
});

module.exports = router;
