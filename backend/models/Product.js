const mongoose = require('mongoose');
const { normalizeImageUrl } = require('../utils/media');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String, // URL or file path
  featured: Boolean,
  type: String, // e.g., 'decor' (Handmade Crafts), 'food' (Cottage Foods)
  subcategory: String,
  stock: { type: Number, default: 1 },
  options: [String], // e.g., ["Small", "Medium", "Large"]
  collection: String, // e.g., 'christmas', 'halloween', 'easter', etc.
  occasion: String // e.g., 'birthday', 'wedding', 'anniversary', etc.
});

// Virtual for imageUrl that provides canonical image URL
productSchema.virtual('imageUrl').get(function() {
  return normalizeImageUrl(this.image);
});

// Ensure virtuals are included when converting to JSON or Object
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
