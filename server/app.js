/**
 * SmartClaimr — Express Server Entry Point
 *
 * Database initialization, auth routes, and middleware.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize database (creates schema on first run)
const { getDb } = require('./db/init');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const expenseRoutes = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── Routes ─────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);

// ── Health Check ───────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'SmartClaimr API',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error handler ──────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ──────────────────────────────────────
// Initialize DB before starting server
getDb();

app.listen(PORT, () => {
  console.log(`\n  🚀 SmartClaimr API running on http://localhost:${PORT}`);
  console.log(`  📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`  🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`  👥 Users: http://localhost:${PORT}/api/users`);
  console.log(`  💰 Expenses: http://localhost:${PORT}/api/expenses\n`);
});
