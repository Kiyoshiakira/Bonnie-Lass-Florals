const mongoose = require('mongoose');
const { normalizeImageUrl } = require('../utils/media');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String, // URL or file path - primary image (for backward compatibility)
  images: [String], // Array of image URLs - for multi-image support
  featured: Boolean,
  type: String, // e.g., 'decor' (Handmade Crafts), 'food' (Cottage Foods)
  subcategory: String,
  stock: { type: Number, default: 1 },
  options: [String], // e.g., ["Small", "Medium", "Large"]
  collection: String, // e.g., 'christmas', 'halloween', 'easter', etc.
  occasion: String, // e.g., 'birthday', 'wedding', 'anniversary', etc.
  // Extended details fields for additional product information
  extendedDetails: {
    ingredients: String, // For food items - list of ingredients
    allergens: String, // Allergen information
    nutritionalInfo: String, // Nutritional information for food products
    recipe: String, // Recipe or usage instructions
    careInstructions: String, // Care instructions for crafts/decorations
    dimensions: String, // Product dimensions
    materials: String, // Materials used in crafts
    weight: String, // Product weight
    storageInstructions: String, // How to store the product
    expirationInfo: String, // Expiration or shelf life information
    additionalNotes: String // Any other relevant information
  }
});

// Virtual for imageUrl that provides canonical image URL
productSchema.virtual('imageUrl').get(function() {
  return normalizeImageUrl(this.image);
});

// Virtual for normalized images array
productSchema.virtual('imageUrls').get(function() {
  if (this.images && this.images.length > 0) {
    return this.images.map(img => normalizeImageUrl(img));
  }
  // Fallback to single image if no images array
  if (this.image) {
    return [normalizeImageUrl(this.image)];
  }
  return [];
});

// Ensure virtuals are included when converting to JSON or Object
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
