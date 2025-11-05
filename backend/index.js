require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('./utils/logger');
const app = express();
const PORT = process.env.PORT || 5000;

// --- Initialize Firebase Admin early ---
// This ensures Firebase Admin is initialized before any routes or middleware that depend on it
require('./utils/firebaseAdmin');
logger.info('Firebase Admin initialized');

// --- CORS setup ---
// Parse allowed origins from environment variable or use default
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGINS || 'https://bonnielassflorals.com')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (CLIENT_ORIGINS.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    return callback(new Error('CORS: Origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
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

// --- Session Configuration ---
// Configure session with secure defaults
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === 'production') {
  logger.error('SESSION_SECRET environment variable is required in production');
  process.exit(1);
}

const sessionConfig = {
  secret: sessionSecret || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax' // CSRF protection
  },
  name: 'sessionId' // Custom session cookie name (instead of default 'connect.sid')
};

// Use MongoStore for session persistence if MONGO_URI is available
if (process.env.MONGO_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600, // Lazy session update - only update session once per 24 hours unless data changed
    crypto: {
      secret: sessionSecret || 'dev-secret-change-in-production'
    }
  });
  logger.info('Session store: MongoStore (persistent)');
} else {
  logger.warn('Session store: MemoryStore (not suitable for production - sessions will be lost on restart)');
}

app.use(session(sessionConfig));
logger.info('Session middleware configured');

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

logger.info('Loading router: /api/reviews');
app.use('/api/reviews', require('./routes/reviews'));

logger.info('Loading router: /api/chatbot');
app.use('/api/chatbot', require('./routes/chatbot'));

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
