const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Signup
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();
    res.status(201).json({ message: 'User created!' });
  } catch (_err) {
    res.status(400).json({ error: 'Email already exists or invalid details.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    res.json({ message: 'Login successful!', user: { email: user.email, name: user.name } });
  } else {
    res.status(400).json({ error: 'Invalid email or password.' });
  }
});

module.exports = router;
