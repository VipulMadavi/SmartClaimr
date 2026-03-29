/**
 * SmartClaimr — Auth Routes
 *
 * POST /api/auth/signup  — creates company + admin user, returns JWT
 * POST /api/auth/login   — validates credentials, returns JWT
 * GET  /api/auth/me      — returns current user info (requires auth)
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/init');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smartclaimr_dev_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * POST /api/auth/signup
 *
 * Body: { name, email, password, companyName, country, currencyCode }
 * Creates a new company and the first admin user.
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, companyName, country, currencyCode } = req.body;

    // ── Validation ──────────────────────
    if (!name || !email || !password || !companyName) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, password, companyName',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    const db = getDb();

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // ── Create company + admin in a transaction ──────
    const hash = await bcrypt.hash(password, 10);

    const result = db.transaction(() => {
      // Create company
      const companyResult = db.prepare(
        'INSERT INTO companies (name, country, currency_code) VALUES (?, ?, ?)'
      ).run(companyName, country || 'India', currencyCode || 'INR');

      const companyId = companyResult.lastInsertRowid;

      // Create admin user
      const userResult = db.prepare(
        'INSERT INTO users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
      ).run(companyId, name, email, hash, 'admin');

      return {
        userId: userResult.lastInsertRowid,
        companyId,
      };
    })();

    // ── Generate JWT ────────────────────
    const token = jwt.sign(
      { userId: Number(result.userId), companyId: Number(result.companyId), role: 'admin' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: Number(result.userId),
        name,
        email,
        role: 'admin',
        companyId: Number(result.companyId),
        companyName,
        currencyCode: currencyCode || 'INR',
      },
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

/**
 * POST /api/auth/login
 *
 * Body: { email, password }
 * Returns JWT with user info.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = getDb();

    // Fetch user with company info
    const user = db.prepare(`
      SELECT u.id, u.company_id, u.name, u.email, u.password_hash, u.role,
             c.name as company_name, c.currency_code
      FROM users u
      JOIN companies c ON u.company_id = c.id
      WHERE u.email = ?
    `).get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // ── Generate JWT ────────────────────
    const token = jwt.sign(
      { userId: user.id, companyId: user.company_id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.company_id,
        companyName: user.company_name,
        currencyCode: user.currency_code,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

/**
 * GET /api/auth/me
 *
 * Returns the authenticated user's profile info.
 * Requires valid JWT.
 */
router.get('/me', authenticate, (req, res) => {
  const db = getDb();

  const user = db.prepare(`
    SELECT u.id, u.company_id, u.name, u.email, u.role,
           c.name as company_name, c.currency_code
    FROM users u
    JOIN companies c ON u.company_id = c.id
    WHERE u.id = ?
  `).get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.company_id,
      companyName: user.company_name,
      currencyCode: user.currency_code,
    },
  });
});

module.exports = router;
