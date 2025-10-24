require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('./utils/logger');
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
      logger.warn('CORS blocked origin:', origin);
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());

// --- Security Headers ---
app.use(helmet());

// --- Rate Limiting ---
// Global rate limiter for all API routes (60 requests per minute per IP)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api/', globalLimiter);

// --- Middleware ---
app.use(express.json());

// --- Serve static files for uploaded images ---
// This allows images to be accessed at /admin/uploads/filename.jpg
const uploadsPath = path.join(__dirname, 'public', 'admin', 'uploads');
app.use('/admin/uploads', express.static(uploadsPath));
logger.info('Serving static uploads from:', uploadsPath);

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error('MongoDB connection error:', err));

// --- ROUTE REGISTRATION (with debug logging) ---
logger.info('Loading router: /api/auth');
app.use('/api/auth', require('./routes/auth'));

logger.info('Loading router: /api/contact');
app.use('/api/contact', require('./routes/contact'));

logger.info('Loading router: /api/products');
app.use('/api/products', require('./routes/products'));

logger.info('Loading router: /api/orders');
app.use('/api/orders', require('./routes/orders'));

logger.info('Loading router: /api/messages');
app.use('/api/messages', require('./routes/messages'));

logger.info('Loading router: /api/payments');
app.use('/api/payments', require('./routes/payments'));

logger.info('Loading router: /api/settings');
app.use('/api/settings', require('./routes/settings'));

logger.info('Loading router: /api/admin');
app.use('/api/admin', require('./routes/admin'));

// --- Optional: Add gallery/socials routes if you have them ---
// app.use('/api/gallery', require('./routes/gallery'));
// app.use('/api/socials', require('./routes/socials'));

// --- Centralized Error Handler ---
// Must be after all routes
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// --- 404 Handler for unmatched API routes ---
app.use((req, res) => {
  res.status(404).json({ error: 'API only' });
});

// --- Start Server ---
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
