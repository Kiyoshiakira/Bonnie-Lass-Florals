const express = require('express');
const router = express.Router();
const GalleryItem = require('../models/GalleryItem');

// Get all gallery items
router.get('/', async (req, res) => {
  const gallery = await GalleryItem.find();
  res.json(gallery);
});

// Upload new gallery item
router.post('/', async (req, res) => {
  // Handle image upload and save URL in req.body.image
  const item = new GalleryItem(req.body);
  await item.save();
  res.status(201).json(item);
});

module.exports = router;