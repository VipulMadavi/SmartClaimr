/**
 * AddExpense — Expense submission form.
 *
 * Features:
 *   - Receipt upload area (placeholder for Phase 6 OCR)
 *   - Amount, currency, category, description, date fields
 *   - "Amount in company currency" read-only display (placeholder for Phase 5)
 *   - Submit button
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { CATEGORY_CONFIG } from '../components/ExpenseCard';
import api from '../services/api';

const COMMON_CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
];

export default function AddExpense() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    amount: '',
    currencyCode: user?.currencyCode || 'INR',
    category: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  /**
   * Handle form field changes
   */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }

  /**
   * Handle receipt file selection (visual preview only — OCR in Phase 6)
   */
  function handleReceiptChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  /**
   * Submit expense
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.amount || !form.category || !form.expenseDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (Number(form.amount) <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/expenses', {
        amount: Number(form.amount),
        currencyCode: form.currencyCode,
        category: form.category,
        description: form.description,
        expenseDate: form.expenseDate,
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedCategory = CATEGORY_CONFIG[form.category];

  return (
    <Layout>
      <div className="max-w-xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-3"
            id="back-to-dashboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900">
            New Expense
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Fill in the details below to submit your expense
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Receipt Upload Area ─────────────── */}
          <div className="card p-5">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              📸 Receipt (optional)
            </label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
                ${receiptPreview
                  ? 'border-success-400 bg-success-50/30'
                  : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50/20'
                }`}
            >
              {receiptPreview ? (
                <div className="relative">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="max-h-48 mx-auto rounded-lg shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setReceiptPreview(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger-500 text-white text-xs flex items-center justify-center shadow-sm hover:bg-danger-600 transition-colors"
                  >
                    ×
                  </button>
                  <p className="text-xs text-success-600 mt-2 font-medium">
                    ✓ Receipt attached — OCR auto-fill coming in Phase 6
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-3xl mb-2">📄</div>
                  <p className="text-sm text-slate-500 mb-1">
                    Drag & drop a receipt, or click to browse
                  </p>
                  <p className="text-xs text-slate-400">
                    PNG, JPG, or PDF up to 10MB
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleReceiptChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="receipt-upload"
              />
            </div>
          </div>

          {/* ── Amount + Currency ──────────────── */}
          <div className="card p-5 space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Amount <span className="text-danger-500">*</span>
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    {COMMON_CURRENCIES.find((c) => c.code === form.currencyCode)?.symbol || '$'}
                  </span>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="input pl-9 text-xl font-bold"
                  />
                </div>
                <select
                  name="currencyCode"
                  value={form.currencyCode}
                  onChange={handleChange}
                  className="input w-32 text-sm"
                  id="currency-select"
                >
                  {COMMON_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount in company currency — Phase 5 placeholder */}
            {form.currencyCode !== user?.currencyCode && form.amount && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-sm">≈</span>
                <span className="text-sm text-slate-500">
                  Converted amount in {user?.currencyCode} — coming in Phase 5
                </span>
              </div>
            )}
          </div>

          {/* ── Category ──────────────────────── */}
          <div className="card p-5">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Category <span className="text-danger-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, category: key }))}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-center
                    ${form.category === key
                      ? 'border-brand-500 bg-brand-50 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  id={`category-${key}`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className={`text-xs font-medium ${form.category === key ? 'text-brand-700' : 'text-slate-600'}`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Description + Date ────────────── */}
          <div className="card p-5 space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief note about this expense..."
                rows={2}
                className="input resize-none"
              />
            </div>

            <div>
              <label htmlFor="expenseDate" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Date <span className="text-danger-500">*</span>
              </label>
              <input
                type="date"
                id="expenseDate"
                name="expenseDate"
                value={form.expenseDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="input"
              />
            </div>
          </div>

          {/* ── Error Message ─────────────────── */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger-50 border border-danger-200 text-danger-600 text-sm animate-slide-down">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── Submit ────────────────────────── */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-ghost flex-1"
              id="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.amount || !form.category}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              id="submit-expense-btn"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                '✓ Submit Expense'
              )}
            </button>
          </div>

          {/* ── Preview card ──────────────────── */}
          {form.amount && form.category && (
            <div className="mt-2 animate-slide-up">
              <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Preview</p>
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  {selectedCategory && (
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${selectedCategory.color} flex items-center justify-center text-base flex-shrink-0`}>
                      {selectedCategory.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">
                      {selectedCategory?.label || 'Expense'}
                    </p>
                    {form.description && (
                      <p className="text-xs text-slate-400 truncate">{form.description}</p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {COMMON_CURRENCIES.find((c) => c.code === form.currencyCode)?.symbol}
                    {Number(form.amount).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}
