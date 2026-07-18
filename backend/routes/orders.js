const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const { isAdminEmail } = require('../config/admins');

// Utility to detect admin user
function isAdmin(req) {
  // Prefer req.user (set by auth middleware), fallback to req.session.user for backward compatibility
  const email = (req.user && req.user.email) || (req.session && req.session.user && req.session.user.email);
  return email ? isAdminEmail(email) : false;
}

function getAuthenticatedUserId(req) {
  return (req.user && req.user._id) || (req.session && req.session.user && req.session.user._id);
}

function getMongoUserId(req) {
  const userId = getAuthenticatedUserId(req);
  return mongoose.Types.ObjectId.isValid(userId) ? userId : null;
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
    const userId = getMongoUserId(req);
    if (!userId) return res.json([]);
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
    const userId = getMongoUserId(req);
    const newOrder = new Order({
      ...(userId ? { user: userId } : {}),
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
