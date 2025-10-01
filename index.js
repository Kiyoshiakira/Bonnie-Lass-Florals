require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const cors = require('cors');
app.use(cors({
  origin: 'https://bonnielassflorals.com', // your real site
  credentials: true
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/payments', require('./routes/payments'));

// Optional: catch-all for any non-API requests
app.use((req, res) => {
  res.status(404).json({ error: 'API only' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
