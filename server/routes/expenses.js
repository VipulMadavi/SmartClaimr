/**
 * SmartClaimr — Expense Routes
 *
 * POST   /api/expenses       — create expense (any authenticated user)
 * GET    /api/expenses       — list expenses scoped by role
 * GET    /api/expenses/:id   — single expense with approval history
 */

const express = require('express');
const { getDb } = require('../db/init');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All expense routes require authentication
router.use(authenticate);

/**
 * POST /api/expenses
 *
 * Creates a new expense for the authenticated user.
 * Body: { amount, currencyCode, category, description, expenseDate, receiptUrl? }
 */
router.post('/', (req, res) => {
  try {
    const { amount, currencyCode, category, description, expenseDate, receiptUrl } = req.body;

    // ── Validation ──────────────────────
    if (!amount || !currencyCode || !category || !expenseDate) {
      return res.status(400).json({
        error: 'Missing required fields: amount, currencyCode, category, expenseDate',
      });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    const validCategories = [
      'food', 'travel', 'lodging', 'transport', 'office_supplies',
      'software', 'entertainment', 'communication', 'other',
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    const db = getDb();

    // Get company currency for conversion placeholder
    const company = db.prepare('SELECT currency_code FROM companies WHERE id = ?')
      .get(req.user.company_id);

    // Amount in company currency — placeholder for Phase 5 (currency conversion)
    const amountInCompanyCurrency = currencyCode === company.currency_code
      ? amount
      : null; // Will be filled by currency conversion service in Phase 5

    const result = db.prepare(`
      INSERT INTO expenses (employee_id, amount, currency_code, amount_in_company_currency, category, description, expense_date, receipt_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      amount,
      currencyCode,
      amountInCompanyCurrency,
      category,
      description || null,
      expenseDate,
      receiptUrl || null,
    );

    // Fetch the created expense with employee info
    const expense = db.prepare(`
      SELECT
        e.*,
        u.name as employee_name,
        u.email as employee_email
      FROM expenses e
      JOIN users u ON e.employee_id = u.id
      WHERE e.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Expense submitted successfully',
      expense,
    });
  } catch (err) {
    console.error('Create expense error:', err.message);
    res.status(500).json({ error: 'Failed to submit expense.' });
  }
});

/**
 * GET /api/expenses
 *
 * Lists expenses scoped by role:
 *   - employee: own expenses only
 *   - manager: own + team expenses (employees reporting to them)
 *   - admin: all company expenses
 *
 * Query params:
 *   - status: 'pending' | 'approved' | 'rejected' | 'all' (default: 'all')
 *   - page: number (default: 1)
 *   - limit: number (default: 20)
 */
router.get('/', (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;
    const db = getDb();
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '';
    const params = [];

    // Scope by role
    switch (req.user.role) {
      case 'employee':
        whereClause = 'WHERE e.employee_id = ?';
        params.push(req.user.id);
        break;

      case 'manager':
        // Manager sees own expenses + their team's expenses
        whereClause = `WHERE (e.employee_id = ? OR e.employee_id IN (
          SELECT id FROM users WHERE manager_id = ? AND company_id = ?
        ))`;
        params.push(req.user.id, req.user.id, req.user.company_id);
        break;

      case 'admin':
        // Admin sees all company expenses
        whereClause = `WHERE e.employee_id IN (
          SELECT id FROM users WHERE company_id = ?
        )`;
        params.push(req.user.company_id);
        break;
    }

    // Filter by status
    if (status !== 'all') {
      whereClause += ' AND e.status = ?';
      params.push(status);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM expenses e
      ${whereClause}
    `;
    const { total } = db.prepare(countQuery).get(...params);

    // Get summary stats
    const statsParams = [...params]; // Clone params for stats query
    const statsQuery = `
      SELECT
        COUNT(*) as total_expenses,
        COALESCE(SUM(CASE WHEN e.status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count,
        COALESCE(SUM(CASE WHEN e.status = 'approved' THEN 1 ELSE 0 END), 0) as approved_count,
        COALESCE(SUM(CASE WHEN e.status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected_count,
        COALESCE(SUM(CASE WHEN e.status = 'pending' THEN e.amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN e.status = 'approved' AND strftime('%Y-%m', e.created_at) = strftime('%Y-%m', 'now') THEN e.amount ELSE 0 END), 0) as approved_this_month
      FROM expenses e
      ${whereClause}
    `;
    // Need fresh params for stats since we don't want status filter
    let statsWhereClause = '';
    const statsParamsFresh = [];
    switch (req.user.role) {
      case 'employee':
        statsWhereClause = 'WHERE e.employee_id = ?';
        statsParamsFresh.push(req.user.id);
        break;
      case 'manager':
        statsWhereClause = `WHERE (e.employee_id = ? OR e.employee_id IN (
          SELECT id FROM users WHERE manager_id = ? AND company_id = ?
        ))`;
        statsParamsFresh.push(req.user.id, req.user.id, req.user.company_id);
        break;
      case 'admin':
        statsWhereClause = `WHERE e.employee_id IN (
          SELECT id FROM users WHERE company_id = ?
        )`;
        statsParamsFresh.push(req.user.company_id);
        break;
    }

    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_expenses,
        COALESCE(SUM(CASE WHEN e.status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count,
        COALESCE(SUM(CASE WHEN e.status = 'approved' THEN 1 ELSE 0 END), 0) as approved_count,
        COALESCE(SUM(CASE WHEN e.status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected_count,
        COALESCE(SUM(CASE WHEN e.status = 'pending' THEN e.amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN e.status = 'approved' AND strftime('%Y-%m', e.created_at) = strftime('%Y-%m', 'now') THEN e.amount ELSE 0 END), 0) as approved_this_month
      FROM expenses e
      ${statsWhereClause}
    `).get(...statsParamsFresh);

    // Get paginated expenses
    const expenses = db.prepare(`
      SELECT
        e.*,
        u.name as employee_name,
        u.email as employee_email
      FROM expenses e
      JOIN users u ON e.employee_id = u.id
      ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, Number(limit), offset);

    res.json({
      expenses,
      stats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('List expenses error:', err.message);
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
});

/**
 * GET /api/expenses/:id
 *
 * Returns a single expense with full approval history.
 * Access control: employee can only see own, manager can see team's, admin sees all.
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    // Fetch expense with employee info
    const expense = db.prepare(`
      SELECT
        e.*,
        u.name as employee_name,
        u.email as employee_email,
        u.company_id
      FROM expenses e
      JOIN users u ON e.employee_id = u.id
      WHERE e.id = ?
    `).get(id);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    // Access control
    const hasAccess = (() => {
      if (req.user.role === 'admin' && expense.company_id === req.user.company_id) return true;
      if (expense.employee_id === req.user.id) return true;
      if (req.user.role === 'manager') {
        const employee = db.prepare('SELECT manager_id FROM users WHERE id = ?')
          .get(expense.employee_id);
        return employee && employee.manager_id === req.user.id;
      }
      return false;
    })();

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Fetch approval history
    const approvals = db.prepare(`
      SELECT
        ea.*,
        u.name as approver_name,
        u.role as approver_role
      FROM expense_approvals ea
      JOIN users u ON ea.approver_id = u.id
      WHERE ea.expense_id = ?
      ORDER BY ea.acted_at ASC
    `).all(id);

    res.json({
      expense,
      approvals,
    });
  } catch (err) {
    console.error('Get expense error:', err.message);
    res.status(500).json({ error: 'Failed to fetch expense.' });
  }
});

module.exports = router;
