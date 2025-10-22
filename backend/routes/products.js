const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const firebaseAdminAuth = require('../middleware/firebaseAdminAuth'); // NEW
const Papa = require('papaparse');

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/admin/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, type, subcategory, stock, options } = req.body;
    const image = req.file
      ? `/admin/uploads/${req.file.filename}`
      : req.body.image || '';
    const parsedOptions = options ? options.split(',').map(s => s.trim()) : [];

    const product = new Product({
      name,
      description,
      price,
      image,
      type,
      subcategory,
      stock: parseInt(stock, 10) || 1,
      options: parsedOptions,
      featured: false
    });

    await product.save();
    res.json({ message: 'Product uploaded successfully!', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed.' });
  }
});

// GET /api/products - fetch all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// DELETE /api/products/:id - admin only!
router.delete('/:id', firebaseAdminAuth, async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:id - update product - admin only!
router.put('/:id', firebaseAdminAuth, upload.single('image'), async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const { name, description, price, type, subcategory, stock, options } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const updateData = {
      name,
      description,
      price: parseFloat(price),
      type,
      subcategory: subcategory || '',
      stock: parseInt(stock, 10) || 1,
      options: options ? (typeof options === 'string' ? options.split(',').map(s => s.trim()) : options) : []
    };

    // Update image if a new one is provided
    if (req.file) {
      updateData.image = `/admin/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product updated successfully!', product: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed.' });
  }
});

// POST /api/products/batch - batch upload via CSV - admin only!
router.post('/batch', firebaseAdminAuth, async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Invalid CSV data. Products array is required.' });
    }

    // Limit batch size to prevent abuse
    if (products.length > 100) {
      return res.status(400).json({ error: 'Batch size limited to 100 products per request.' });
    }

    const results = {
      success: [],
      errors: []
    };

    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      try {
        const name = item.name || item.TITLE;
        const description = item.description || item.DESCRIPTION;
        const price = parseFloat(item.price || item.PRICE);

        // Validate required fields
        if (!name || !description || isNaN(price)) {
          results.errors.push({ row: i + 1, error: 'Missing required fields: name, description, or price', data: item });
          continue;
        }

        // Map CSV fields to product schema
        const product = new Product({
          name,
          description,
          price,
          image: item.image || item.IMAGE1 || '',
          type: item.type || 'decor',
          subcategory: item.subcategory || '',
          stock: parseInt(item.stock || item.QUANTITY || 1, 10),
          options: item.options ? (typeof item.options === 'string' ? item.options.split(',').map(s => s.trim()) : item.options) : [],
          featured: false
        });

        await product.save();
        results.success.push({ row: i + 1, name: product.name, id: product._id });
      } catch (err) {
        results.errors.push({ row: i + 1, error: err.message, data: item });
      }
    }

    res.json({
      message: `Batch upload completed. ${results.success.length} products uploaded, ${results.errors.length} failed.`,
      results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Batch upload failed.' });
  }
});

module.exports = router;
