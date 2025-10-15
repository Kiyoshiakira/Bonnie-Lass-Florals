const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const firebaseAdminAuth = require('../middleware/firebaseAdminAuth'); // NEW

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
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
