require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS setup ---
// Parse allowed origins from environment variable or use default list
const allowedOrigins = process.env.FRONTEND_ORIGINS 
  ? process.env.FRONTEND_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'https://bonnielassflorals.com',
      'https://bonnie-lass-florals.onrender.com',
      'https://bonnie-lass-florals.web.app',
      'https://bonnie-lass-florals.firebaseapp.com'
    ];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());

// --- Middleware ---
app.use(express.json());

// --- Serve static files for uploaded images ---
// This allows images to be accessed at /admin/uploads/filename.jpg
const uploadsPath = path.join(__dirname, 'public', 'admin', 'uploads');
app.use('/admin/uploads', express.static(uploadsPath));
console.log('Serving static uploads from:', uploadsPath);

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

console.log('Loading router: /api/settings');
app.use('/api/settings', require('./routes/settings'));

console.log('Loading router: /api/admin');
app.use('/api/admin', require('./routes/admin'));

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
