const express = require('express');
const router = express.Router();

// This just saves messages in memory for now.
// Later, you can email them or save to database.
let messages = [];

router.post('/', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields required.' });
  }
  messages.push({ name, email, message, date: new Date() });
  res.json({ message: 'Message sent! Thank you for contacting us.' });
});

module.exports = router;
