const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // made optional!
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 }
    }
  ],
  total: Number,
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'Processing' },
  payment: {
    method: String, // 'square', 'paypal', 'card'
    status: String, // 'paid', 'pending', 'failed'
    transactionId: String
  }
});

module.exports = mongoose.model('Order', orderSchema);
