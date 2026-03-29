/**
 * SmartClaimr — Approval Routes
 *
 * GET    /api/approvals/pending           — expenses awaiting current user's approval
 * POST   /api/approvals/:expenseId/approve — approve an expense
 * POST   /api/approvals/:expenseId/reject  — reject an expense
 *
 * Approval Logic (2-level):
 *   IF amount < 5000:
 *       Manager approves → status = 'approved' (DONE)
 *   IF amount >= 5000:
 *       Manager approves → stays 'pending', escalates to admin
 *       Admin approves → status = 'approved' (DONE)
 *   ANY rejection at any level → status = 'rejected' (DONE)
 */

const express = require('express');
const { getDb } = require('../db/init');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All approval routes require authentication + manager or admin role
router.use(authenticate, authorize('manager', 'admin'));

// Threshold for 2-level approval (in company currency)
const HIGH_VALUE_THRESHOLD = 5000;

/**
 * GET /api/approvals/pending
 *
 * Returns expenses awaiting the current user's approval.
 * - Manager: sees pending expenses from employees reporting to them
 *            (only those not yet approved by any manager)
 * - Admin:   sees expenses that have been manager-approved but need admin sign-off
 *            (amount >= threshold), PLUS direct pending if admin is also assigned as manager
 */
router.get('/pending', (req, res) => {
  try {
    const db = getDb();
    let expenses;

    if (req.user.role === 'manager') {
      // Manager sees pending expenses from their direct reports
      // that have NOT yet been acted on by this manager
      expenses = db.prepare(`
        SELECT
          e.*,
          u.name as employee_name,
          u.email as employee_email
        FROM expenses e
        JOIN users u ON e.employee_id = u.id
        WHERE e.status = 'pending'
          AND u.manager_id = ?
          AND u.company_id = ?
          AND e.id NOT IN (
            SELECT expense_id FROM expense_approvals WHERE approver_id = ?
          )
        ORDER BY e.created_at DESC
      `).all(req.user.id, req.user.company_id, req.user.id);

    } else if (req.user.role === 'admin') {
      // Admin sees:
      // 1. High-value expenses (>= threshold) that have been approved by a manager
      //    but still have status 'pending' (awaiting admin final approval)
      // 2. Expenses from users who report directly to admin (if admin is also a manager)
      expenses = db.prepare(`
        SELECT
          e.*,
          u.name as employee_name,
          u.email as employee_email
        FROM expenses e
        JOIN users u ON e.employee_id = u.id
        WHERE e.status = 'pending'
          AND u.company_id = ?
          AND e.id NOT IN (
            SELECT expense_id FROM expense_approvals WHERE approver_id = ?
          )
          AND (
            -- High-value expenses already approved by a manager
            (e.amount >= ? AND e.id IN (
              SELECT ea.expense_id FROM expense_approvals ea
              JOIN users approver ON ea.approver_id = approver.id
              WHERE ea.status = 'approved' AND approver.role = 'manager'
            ))
            OR
            -- Expenses from admin's direct reports (low value, not yet acted on)
            (u.manager_id = ? AND e.id NOT IN (
              SELECT expense_id FROM expense_approvals
            ))
          )
        ORDER BY e.created_at DESC
      `).all(req.user.company_id, req.user.id, HIGH_VALUE_THRESHOLD, req.user.id);
    }

    // Add approval history for each expense
    const expensesWithHistory = (expenses || []).map(expense => {
      const approvals = db.prepare(`
        SELECT
          ea.*,
          u.name as approver_name,
          u.role as approver_role
        FROM expense_approvals ea
        JOIN users u ON ea.approver_id = u.id
        WHERE ea.expense_id = ?
        ORDER BY ea.acted_at ASC
      `).all(expense.id);

      return {
        ...expense,
        approvals,
        needs_admin_escalation: expense.amount >= HIGH_VALUE_THRESHOLD,
      };
    });

    res.json({
      expenses: expensesWithHistory,
      count: expensesWithHistory.length,
    });
  } catch (err) {
    console.error('Get pending approvals error:', err.message);
    res.status(500).json({ error: 'Failed to fetch pending approvals.' });
  }
});

/**
 * POST /api/approvals/:expenseId/approve
 *
 * Approve an expense.
 * Body (optional): { comment }
 *
 * Logic:
 *   - Manager approves:
 *       if amount < threshold → finalize as 'approved'
 *       if amount >= threshold → record approval, keep as 'pending' (escalate to admin)
 *   - Admin approves:
 *       → finalize as 'approved'
 */
router.post('/:expenseId/approve', (req, res) => {
  try {
    const { expenseId } = req.params;
    const { comment } = req.body || {};
    const db = getDb();

    // Fetch expense
    const expense = db.prepare(`
      SELECT e.*, u.company_id, u.manager_id
      FROM expenses e
      JOIN users u ON e.employee_id = u.id
      WHERE e.id = ?
    `).get(expenseId);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    if (expense.status !== 'pending') {
      return res.status(400).json({ error: `Expense is already ${expense.status}.` });
    }

    // Verify this expense belongs to the same company
    if (expense.company_id !== req.user.company_id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Check if user already acted on this expense
    const existingApproval = db.prepare(
      'SELECT id FROM expense_approvals WHERE expense_id = ? AND approver_id = ?'
    ).get(expenseId, req.user.id);

    if (existingApproval) {
      return res.status(400).json({ error: 'You have already acted on this expense.' });
    }

    // Verify the approver has authority
    if (req.user.role === 'manager') {
      // Manager can only approve expenses from their direct reports
      const employee = db.prepare('SELECT manager_id FROM users WHERE id = ?')
        .get(expense.employee_id);
      if (!employee || employee.manager_id !== req.user.id) {
        return res.status(403).json({ error: 'You can only approve expenses from your direct reports.' });
      }
    }

    // Record the approval
    db.prepare(`
      INSERT INTO expense_approvals (expense_id, approver_id, status, comment)
      VALUES (?, ?, 'approved', ?)
    `).run(expenseId, req.user.id, comment || null);

    // Determine if expense should be finalized
    let finalized = false;
    let escalated = false;

    if (req.user.role === 'admin') {
      // Admin approval always finalizes
      db.prepare("UPDATE expenses SET status = 'approved' WHERE id = ?").run(expenseId);
      finalized = true;
    } else if (req.user.role === 'manager') {
      if (expense.amount < HIGH_VALUE_THRESHOLD) {
        // Low-value: manager approval finalizes
        db.prepare("UPDATE expenses SET status = 'approved' WHERE id = ?").run(expenseId);
        finalized = true;
      } else {
        // High-value: stays pending, escalates to admin
        escalated = true;
      }
    }

    res.json({
      message: finalized
        ? 'Expense approved successfully.'
        : 'Expense approved by manager. Escalated to admin for final approval.',
      finalized,
      escalated,
      expenseId: Number(expenseId),
    });
  } catch (err) {
    console.error('Approve expense error:', err.message);
    res.status(500).json({ error: 'Failed to approve expense.' });
  }
});

/**
 * POST /api/approvals/:expenseId/reject
 *
 * Reject an expense. Rejection at any level finalizes immediately.
 * Body (optional): { comment }
 */
router.post('/:expenseId/reject', (req, res) => {
  try {
    const { expenseId } = req.params;
    const { comment } = req.body || {};
    const db = getDb();

    // Fetch expense
    const expense = db.prepare(`
      SELECT e.*, u.company_id, u.manager_id
      FROM expenses e
      JOIN users u ON e.employee_id = u.id
      WHERE e.id = ?
    `).get(expenseId);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    if (expense.status !== 'pending') {
      return res.status(400).json({ error: `Expense is already ${expense.status}.` });
    }

    // Verify same company
    if (expense.company_id !== req.user.company_id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Check if user already acted
    const existingApproval = db.prepare(
      'SELECT id FROM expense_approvals WHERE expense_id = ? AND approver_id = ?'
    ).get(expenseId, req.user.id);

    if (existingApproval) {
      return res.status(400).json({ error: 'You have already acted on this expense.' });
    }

    // Verify the approver has authority
    if (req.user.role === 'manager') {
      const employee = db.prepare('SELECT manager_id FROM users WHERE id = ?')
        .get(expense.employee_id);
      if (!employee || employee.manager_id !== req.user.id) {
        return res.status(403).json({ error: 'You can only reject expenses from your direct reports.' });
      }
    }

    // Record the rejection
    db.prepare(`
      INSERT INTO expense_approvals (expense_id, approver_id, status, comment)
      VALUES (?, ?, 'rejected', ?)
    `).run(expenseId, req.user.id, comment || null);

    // Rejection always finalizes
    db.prepare("UPDATE expenses SET status = 'rejected' WHERE id = ?").run(expenseId);

    res.json({
      message: 'Expense rejected.',
      finalized: true,
      expenseId: Number(expenseId),
    });
  } catch (err) {
    console.error('Reject expense error:', err.message);
    res.status(500).json({ error: 'Failed to reject expense.' });
  }
});

module.exports = router;
