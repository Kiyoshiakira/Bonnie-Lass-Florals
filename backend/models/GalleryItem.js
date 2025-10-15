const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String, // URL or file path
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
