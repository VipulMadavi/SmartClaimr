/**
 * ApprovalsPage — Manager/Admin approval feed.
 *
 * Shows pending expenses that need the current user's approval.
 * Each card has Approve/Reject buttons with optional comment.
 * Cards animate out on action with a success/error toast.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import ExpenseCard from '../components/ExpenseCard';
import api from '../services/api';

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [actingOn, setActingOn] = useState(null); // expenseId currently being processed
  const [removingIds, setRemovingIds] = useState(new Set()); // ids animating out

  /**
   * Fetch pending approvals
   */
  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/approvals/pending');
      setExpenses(data.expenses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  /**
   * Show a toast notification
   */
  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  /**
   * Handle approve action
   */
  async function handleApprove(expenseId, comment) {
    setActingOn(expenseId);
    try {
      const data = await api.post(`/approvals/${expenseId}/approve`, { comment: comment || undefined });
      // Animate card out
      setRemovingIds(prev => new Set([...prev, expenseId]));
      setTimeout(() => {
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
        setRemovingIds(prev => {
          const next = new Set(prev);
          next.delete(expenseId);
          return next;
        });
      }, 400);
      showToast(
        data.escalated
          ? '⬆️ Approved & escalated to admin'
          : '✅ Expense approved!',
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to approve', 'error');
    } finally {
      setActingOn(null);
    }
  }

  /**
   * Handle reject action
   */
  async function handleReject(expenseId, comment) {
    setActingOn(expenseId);
    try {
      await api.post(`/approvals/${expenseId}/reject`, { comment: comment || undefined });
      // Animate card out
      setRemovingIds(prev => new Set([...prev, expenseId]));
      setTimeout(() => {
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
        setRemovingIds(prev => {
          const next = new Set(prev);
          next.delete(expenseId);
          return next;
        });
      }, 400);
      showToast('❌ Expense rejected', 'error');
    } catch (err) {
      showToast(err.message || 'Failed to reject', 'error');
    } finally {
      setActingOn(null);
    }
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* ── Header ──────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
            Pending Approvals ✅
          </h1>
          <p className="text-slate-500 text-sm">
            {user?.role === 'admin'
              ? 'High-value expenses escalated for your review'
              : 'Expenses from your team awaiting your decision'}
          </p>
        </div>

        {/* ── Summary stat ────────────────────────── */}
        <div className="mb-6">
          <div
            className="card p-4 inline-flex items-center gap-3 animate-slide-up"
            style={{ animationFillMode: 'both' }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning-500/10 to-warning-600/5 flex items-center justify-center text-lg">
              📋
            </div>
            <div>
              <p className="text-2xl font-bold text-warning-600">
                {expenses.length}
              </p>
              <p className="text-xs text-slate-400">Awaiting action</p>
            </div>
          </div>
        </div>

        {/* ── Approval Feed ──────────────────────── */}
        {loading ? (
          /* Skeleton loaders */
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-2/3 mb-3" />
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-slate-200 rounded w-20" />
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                  <div className="h-9 bg-slate-200 rounded-xl flex-1" />
                  <div className="h-9 bg-slate-100 rounded-xl flex-1" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error state */
          <div className="card p-8 text-center">
            <div className="text-3xl mb-3">😵</div>
            <h3 className="font-semibold text-slate-900 mb-1">Something went wrong</h3>
            <p className="text-sm text-slate-500 mb-4">{error}</p>
            <button onClick={fetchPending} className="btn-primary text-sm">
              Try Again
            </button>
          </div>
        ) : expenses.length === 0 ? (
          /* Empty state */
          <div className="card p-12 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-success-400/10 to-success-600/5 text-3xl mb-4">
              🎉
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              All caught up!
            </h3>
            <p className="text-sm text-slate-500">
              No expenses are waiting for your approval right now.
            </p>
          </div>
        ) : (
          /* Expense list with action cards */
          <div className="space-y-3">
            {expenses.map((expense, i) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                variant="action"
                onApprove={(comment) => handleApprove(expense.id, comment)}
                onReject={(comment) => handleReject(expense.id, comment)}
                isProcessing={actingOn === expense.id}
                isRemoving={removingIds.has(expense.id)}
                style={{
                  animationDelay: `${i * 60}ms`,
                  animationFillMode: 'both',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Toast Notification ─────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50
            px-5 py-3 rounded-2xl shadow-elevated
            text-sm font-semibold
            animate-slide-up
            ${toast.type === 'success'
              ? 'bg-success-500 text-white'
              : 'bg-danger-500 text-white'
            }`}
          style={{ animationDuration: '300ms' }}
        >
          {toast.message}
        </div>
      )}
    </Layout>
  );
}
