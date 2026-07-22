const express = require('express');
const cors = require('cors');
require('../config/env');

const app = express();

// Middleware
// Allow the Vite dev server (port 8080 here, or 5173) plus any configured URL.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:8080',
  'http://localhost:5173',
].filter(Boolean);
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
  credentials: true
}));
app.use(express.json({ limit: '2mb' })); // roomy enough for CSV uploads
app.use(express.urlencoded({ extended: true }));

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Feature routes
app.use('/api/auth', require('../modules/auth/auth_routes'));
app.use('/api/user', require('../modules/user/user_routes'));
app.use('/api/decks', require('../modules/deck/deck_routes'));
app.use('/api/cards', require('../modules/card/card_routes'));
app.use('/api/sessions', require('../modules/session/session_routes'));
app.use('/api/analytics', require('../modules/analytics/analytics_routes'));
app.use('/api/social', require('../modules/social/social_routes'));
app.use('/api/achievements', require('../modules/achievement/achievement_routes'));


// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  // Only log unexpected (500) errors; expected 4xx are normal flow.
  if (status >= 500) console.error(err.stack);
  res.status(status).json({
    status: status >= 500 ? 'error' : 'fail',
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
