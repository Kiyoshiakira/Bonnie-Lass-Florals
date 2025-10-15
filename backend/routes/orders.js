const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Utility to detect admin user (customize as needed)
function isAdmin(req) {
  // Example: treat certain emails as admin (set via session or JWT)
  // Adjust logic for your authentication system
  if (req.session && req.session.user && (
      req.session.user.email === "shaunessy24@gmail.com" ||
      req.session.user.email === "bonnielassflorals@gmail.com"
    )) {
    return true;
  }
  return false;
}

// Get all orders (admin only)
router.get('/', auth, async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
  try {
    const orders = await Order.find().populate('user').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get orders for the logged-in user
router.get('/mine', auth, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const { items, total, shippingAddress } = req.body;
    const userId = req.session.user._id;
    const newOrder = new Order({
      user: userId,
      items,
      total,
      shippingAddress,
      status: 'Processing'
    });
    await newOrder.save();
    res.status(201).json({ message: "Order placed!", order: newOrder });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update order status (admin only)
router.patch('/:id', auth, async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
  try {
    const { status } = req.body;
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Order not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an order (admin only)
router.delete('/:id', auth, async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
