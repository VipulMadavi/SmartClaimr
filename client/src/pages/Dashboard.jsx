/**
 * Dashboard — Main expense feed page.
 *
 * Shows:
 *   - Greeting header with summary stats
 *   - Filter tabs: All / Pending / Approved / Rejected
 *   - Expense feed (vertical card list)
 *   - Floating "+ Add Expense" FAB button
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import ExpenseCard from '../components/ExpenseCard';
import api from '../services/api';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch expenses with current filter
   */
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/expenses?status=${activeFilter}`);
      setExpenses(data.expenses);
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  /**
   * Get greeting based on time of day
   */
  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* ── Greeting Header ─────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
            {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 text-sm">
            Here's your expense overview
          </p>
        </div>

        {/* ── Summary Stats ───────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Total',
                value: stats.total_expenses,
                icon: '📊',
                bg: 'from-brand-500/10 to-brand-600/5',
                text: 'text-brand-700',
              },
              {
                label: 'Pending',
                value: stats.pending_count,
                icon: '⏳',
                bg: 'from-warning-500/10 to-warning-600/5',
                text: 'text-warning-600',
              },
              {
                label: 'Approved',
                value: stats.approved_count,
                icon: '✅',
                bg: 'from-success-500/10 to-success-600/5',
                text: 'text-success-600',
              },
              {
                label: 'Rejected',
                value: stats.rejected_count,
                icon: '❌',
                bg: 'from-danger-500/10 to-danger-600/5',
                text: 'text-danger-600',
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="card p-4 animate-slide-up cursor-default"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center text-lg mb-3`}>
                  {stat.icon}
                </div>
                <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter Tabs ─────────────────────────── */}
        <div className="flex items-center gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeFilter === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              id={`filter-${tab.key}`}
            >
              {tab.label}
              {stats && tab.key !== 'all' && (
                <span className="ml-1.5 text-xs opacity-60">
                  {tab.key === 'pending' ? stats.pending_count
                    : tab.key === 'approved' ? stats.approved_count
                    : stats.rejected_count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Expense Feed ────────────────────────── */}
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
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error state */
          <div className="card p-8 text-center">
            <div className="text-3xl mb-3">😵</div>
            <h3 className="font-semibold text-slate-900 mb-1">Something went wrong</h3>
            <p className="text-sm text-slate-500 mb-4">{error}</p>
            <button onClick={fetchExpenses} className="btn-primary text-sm">
              Try Again
            </button>
          </div>
        ) : expenses.length === 0 ? (
          /* Empty state */
          <div className="card p-12 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400/10 to-brand-600/5 text-3xl mb-4">
              {activeFilter === 'all' ? '💸' : activeFilter === 'pending' ? '⏳' : activeFilter === 'approved' ? '✅' : '❌'}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              {activeFilter === 'all'
                ? 'No expenses yet'
                : `No ${activeFilter} expenses`}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {activeFilter === 'all'
                ? 'Submit your first expense to get started!'
                : `You don't have any ${activeFilter} expenses right now.`}
            </p>
            {activeFilter === 'all' && (
              <Link to="/expenses/new" className="btn-primary" id="empty-add-expense-btn">
                + Submit Expense
              </Link>
            )}
          </div>
        ) : (
          /* Expense list */
          <div className="space-y-3">
            {expenses.map((expense, i) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              />
            ))}
          </div>
        )}

        {/* ── FAB — Add Expense ───────────────────── */}
        <Link
          to="/expenses/new"
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 rounded-2xl
            bg-gradient-to-br from-brand-500 to-brand-700
            text-white text-2xl font-light
            flex items-center justify-center
            shadow-elevated hover:shadow-xl
            transition-all duration-300 hover:scale-105 active:scale-95
            z-40"
          title="Add new expense"
          id="fab-add-expense"
        >
          +
        </Link>
      </div>
    </Layout>
  );
}
