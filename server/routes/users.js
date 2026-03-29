/**
 * SmartClaimr — User Management Routes
 *
 * Admin-only endpoints for managing company users.
 *
 * GET    /api/users         — list all company users (admin only)
 * POST   /api/users         — create user with role + managerId (admin only)
 * PATCH  /api/users/:id     — update role or managerId (admin only)
 * DELETE /api/users/:id     — deactivate/delete user (admin only)
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db/init');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All user routes require admin role
router.use(authenticate, authorize('admin'));

/**
 * GET /api/users
 *
 * Returns all users in the admin's company.
 * Includes manager name for users who have a manager assigned.
 */
router.get('/', (req, res) => {
  try {
    const db = getDb();

    const users = db.prepare(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.manager_id,
        u.created_at,
        m.name as manager_name
      FROM users u
      LEFT JOIN users m ON u.manager_id = m.id
      WHERE u.company_id = ?
      ORDER BY
        CASE u.role
          WHEN 'admin' THEN 1
          WHEN 'manager' THEN 2
          WHEN 'employee' THEN 3
        END,
        u.name ASC
    `).all(req.user.company_id);

    res.json({ users });
  } catch (err) {
    console.error('List users error:', err.message);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

/**
 * POST /api/users
 *
 * Creates a new user within the admin's company.
 * Body: { name, email, password, role, managerId? }
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;

    // ── Validation ──────────────────────
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, password, role',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (!['admin', 'manager', 'employee'].includes(role)) {
      return res.status(400).json({ error: 'Role must be admin, manager, or employee.' });
    }

    const db = getDb();

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    // Validate managerId if provided
    if (managerId) {
      const manager = db.prepare(
        'SELECT id, role FROM users WHERE id = ? AND company_id = ?'
      ).get(managerId, req.user.company_id);

      if (!manager) {
        return res.status(400).json({ error: 'Selected manager not found in your company.' });
      }

      if (manager.role === 'employee') {
        return res.status(400).json({ error: 'An employee cannot be assigned as a manager.' });
      }
    }

    // ── Create user ──────────────────────
    const hash = await bcrypt.hash(password, 10);

    const result = db.prepare(
      'INSERT INTO users (company_id, name, email, password_hash, role, manager_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user.company_id, name, email, hash, role, managerId || null);

    // Fetch the created user with manager info
    const newUser = db.prepare(`
      SELECT
        u.id, u.name, u.email, u.role, u.manager_id, u.created_at,
        m.name as manager_name
      FROM users u
      LEFT JOIN users m ON u.manager_id = m.id
      WHERE u.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (err) {
    console.error('Create user error:', err.message);
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

/**
 * PATCH /api/users/:id
 *
 * Updates a user's role and/or manager assignment.
 * Body: { role?, managerId? }
 */
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { role, managerId } = req.body;
    const db = getDb();

    // Verify user belongs to admin's company
    const user = db.prepare(
      'SELECT id, role FROM users WHERE id = ? AND company_id = ?'
    ).get(id, req.user.company_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found in your company.' });
    }

    // Prevent admin from modifying their own role
    if (Number(id) === req.user.id && role && role !== user.role) {
      return res.status(400).json({ error: 'You cannot change your own role.' });
    }

    // Validate role if provided
    if (role && !['admin', 'manager', 'employee'].includes(role)) {
      return res.status(400).json({ error: 'Role must be admin, manager, or employee.' });
    }

    // Validate managerId if provided
    if (managerId) {
      if (Number(managerId) === Number(id)) {
        return res.status(400).json({ error: 'A user cannot be their own manager.' });
      }

      const manager = db.prepare(
        'SELECT id, role FROM users WHERE id = ? AND company_id = ?'
      ).get(managerId, req.user.company_id);

      if (!manager) {
        return res.status(400).json({ error: 'Selected manager not found in your company.' });
      }

      if (manager.role === 'employee') {
        return res.status(400).json({ error: 'An employee cannot be assigned as a manager.' });
      }
    }

    // ── Update user ──────────────────────
    const updates = [];
    const values = [];

    if (role) {
      updates.push('role = ?');
      values.push(role);
    }

    // managerId can be explicitly set to null (remove manager)
    if (managerId !== undefined) {
      updates.push('manager_id = ?');
      values.push(managerId || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update. Provide role or managerId.' });
    }

    values.push(id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    // Fetch updated user
    const updatedUser = db.prepare(`
      SELECT
        u.id, u.name, u.email, u.role, u.manager_id, u.created_at,
        m.name as manager_name
      FROM users u
      LEFT JOIN users m ON u.manager_id = m.id
      WHERE u.id = ?
    `).get(id);

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Update user error:', err.message);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

/**
 * DELETE /api/users/:id
 *
 * Deletes a user from the company.
 * Admin cannot delete themselves.
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    if (Number(id) === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    // Verify user belongs to admin's company
    const user = db.prepare(
      'SELECT id FROM users WHERE id = ? AND company_id = ?'
    ).get(id, req.user.company_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found in your company.' });
    }

    // Remove manager references pointing to this user
    db.prepare('UPDATE users SET manager_id = NULL WHERE manager_id = ?').run(id);

    // Delete the user
    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

module.exports = router;
