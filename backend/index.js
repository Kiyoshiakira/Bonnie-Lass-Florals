require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS setup ---
app.use(cors({
  origin: 'https://bonnielassflorals.com',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());

// --- Middleware ---
app.use(express.json());

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- ROUTE REGISTRATION (with debug logging) ---
console.log('Loading router: /api/auth');
app.use('/api/auth', require('./routes/auth'));

console.log('Loading router: /api/contact');
app.use('/api/contact', require('./routes/contact'));

console.log('Loading router: /api/products');
app.use('/api/products', require('./routes/products'));

console.log('Loading router: /api/orders');
app.use('/api/orders', require('./routes/orders'));

console.log('Loading router: /api/messages');
app.use('/api/messages', require('./routes/messages'));

console.log('Loading router: /api/payments');
app.use('/api/payments', require('./routes/payments'));

// --- Optional: Add gallery/socials routes if you have them ---
// app.use('/api/gallery', require('./routes/gallery'));
// app.use('/api/socials', require('./routes/socials'));

// --- 404 Handler for unmatched API routes ---
app.use((req, res) => {
  res.status(404).json({ error: 'API only' });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
