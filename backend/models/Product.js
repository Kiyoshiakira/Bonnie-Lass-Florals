const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String, // URL or file path
  featured: Boolean,
  type: String, // e.g., 'decor', 'food'
  subcategory: String,
  stock: { type: Number, default: 1 },
  options: [String] // e.g., ["Small", "Medium", "Large"]
});

module.exports = mongoose.model('Product', productSchema);
