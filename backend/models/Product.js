const mongoose = require('mongoose');

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

module.exports = mongoose.model('Product', productSchema);
