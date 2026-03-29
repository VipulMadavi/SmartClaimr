/**
 * AddExpense — Expense submission form.
 *
 * Features:
 *   - Receipt upload with OCR auto-fill (Tesseract.js)
 *   - AI suggestion banner after receipt scan
 *   - Amount, currency, category, description, date fields
 *   - Live currency conversion display
 *   - Submit button
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
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

/** Helper: get symbol for a currency code */
function getCurrencySymbol(code) {
  return COMMON_CURRENCIES.find((c) => c.code === code)?.symbol || code;
}

export default function AddExpense() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

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
  const [receiptFile, setReceiptFile] = useState(null);

  // ── OCR state ─────────────────────────────────
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuggestion, setOcrSuggestion] = useState(null); // AI suggestion string
  const [ocrAutoFilled, setOcrAutoFilled] = useState(false); // Whether fields were auto-filled

  // ── Currency conversion state ─────────────────
  const [conversion, setConversion] = useState(null); // { convertedAmount, rate }
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertError, setConvertError] = useState(null);
  const debounceRef = useRef(null);

  const companyCurrency = user?.currencyCode || 'INR';
  const isForeignCurrency = form.currencyCode !== companyCurrency;

  /**
   * Fetch live conversion when amount or currency changes
   */
  useEffect(() => {
    // Clear previous
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Reset if same currency or no amount
    if (!isForeignCurrency || !form.amount || Number(form.amount) <= 0) {
      setConversion(null);
      setConvertError(null);
      setConvertLoading(false);
      return;
    }

    setConvertLoading(true);
    setConvertError(null);

    // Debounce 400ms to avoid spamming API
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.get(
          `/expenses/convert?amount=${form.amount}&from=${form.currencyCode}&to=${companyCurrency}`
        );
        setConversion({ convertedAmount: data.convertedAmount, rate: data.rate });
        setConvertError(null);
      } catch (err) {
        setConversion(null);
        setConvertError(err.data?.fallback
          ? 'Conversion unavailable — you can still submit.'
          : 'Unable to fetch exchange rate.'
        );
      } finally {
        setConvertLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form.amount, form.currencyCode, companyCurrency, isForeignCurrency]);

  /**
   * Handle form field changes
   */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }

  /**
   * Handle receipt file selection — creates preview + triggers OCR
   */
  async function handleReceiptChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setReceiptPreview(reader.result);
    reader.readAsDataURL(file);
    setReceiptFile(file);

    // ── Trigger OCR ───────────────────────────
    setOcrLoading(true);
    setOcrSuggestion(null);
    setOcrAutoFilled(false);

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const result = await api.upload('/ocr/parse', formData);

      if (result.success && result.extracted) {
        const { amount, date, description, category } = result.extracted;

        // Auto-fill form fields (only non-empty values)
        setForm((prev) => ({
          ...prev,
          ...(amount ? { amount: String(amount) } : {}),
          ...(date ? { expenseDate: date } : {}),
          ...(description ? { description } : {}),
          ...(category ? { category } : {}),
        }));

        setOcrAutoFilled(true);
      }

      // Show AI suggestion
      if (result.suggestion) {
        setOcrSuggestion(result.suggestion);
      }
    } catch (err) {
      console.error('OCR failed:', err.message);
      setOcrSuggestion('Couldn\'t read receipt — please fill in details manually.');
    } finally {
      setOcrLoading(false);
    }
  }

  /**
   * Clear the receipt and reset OCR state
   */
  function clearReceipt() {
    setReceiptPreview(null);
    setReceiptFile(null);
    setOcrSuggestion(null);
    setOcrAutoFilled(false);
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
      showToast('✅ Expense submitted successfully!', 'success');
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
            Upload a receipt for auto-fill, or fill in manually
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Receipt Upload Area ─────────────── */}
          <div className="card p-5">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              📸 Receipt (optional — auto-fills with AI)
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
                    onClick={clearReceipt}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger-500 text-white text-xs flex items-center justify-center shadow-sm hover:bg-danger-600 transition-colors"
                  >
                    ×
                  </button>

                  {/* OCR Loading Indicator */}
                  {ocrLoading && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-sm text-brand-600 animate-pulse">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="font-medium">🧠 Scanning receipt with AI...</span>
                    </div>
                  )}

                  {/* OCR Success */}
                  {!ocrLoading && ocrAutoFilled && (
                    <p className="text-xs text-success-600 mt-2 font-medium">
                      ✓ Receipt scanned — fields auto-filled
                    </p>
                  )}

                  {/* OCR had no auto-fill but completed */}
                  {!ocrLoading && !ocrAutoFilled && ocrSuggestion && (
                    <p className="text-xs text-amber-600 mt-2 font-medium">
                      ⚠️ {ocrSuggestion}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-3xl mb-2">📄</div>
                  <p className="text-sm text-slate-500 mb-1">
                    Drag & drop a receipt, or click to browse
                  </p>
                  <p className="text-xs text-slate-400">
                    PNG, JPG up to 10MB — AI will auto-fill fields
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleReceiptChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="receipt-upload"
              />
            </div>
          </div>

          {/* ── AI Suggestion Banner ──────────────── */}
          {ocrSuggestion && ocrAutoFilled && !ocrLoading && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 animate-slide-down" id="ai-suggestion-banner">
              <span className="text-lg mt-0.5">🧠</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-indigo-800">AI Detection</p>
                <p className="text-sm text-indigo-600">{ocrSuggestion}</p>
                <p className="text-xs text-indigo-400 mt-1">You can edit any auto-filled field below</p>
              </div>
            </div>
          )}

          {/* ── Amount + Currency ──────────────── */}
          <div className="card p-5 space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Amount <span className="text-danger-500">*</span>
                {ocrAutoFilled && form.amount && (
                  <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">AI filled</span>
                )}
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    {getCurrencySymbol(form.currencyCode)}
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

            {/* ── Live Currency Conversion ─────── */}
            {isForeignCurrency && form.amount && Number(form.amount) > 0 && (
              <div className="animate-slide-down">
                {convertLoading ? (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                    <svg className="animate-spin h-4 w-4 text-brand-500" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm text-slate-500">Converting...</span>
                  </div>
                ) : convertError ? (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-amber-500 text-sm">⚠️</span>
                    <span className="text-sm text-amber-700">{convertError}</span>
                  </div>
                ) : conversion ? (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-brand-50/70 to-indigo-50/70 border border-brand-100">
                    <div className="flex items-center gap-2.5">
                      <span className="text-brand-500 text-lg">💱</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          ≈ {getCurrencySymbol(companyCurrency)}{conversion.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-500">
                          1 {form.currencyCode} = {conversion.rate.toFixed(4)} {companyCurrency}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium" id="conversion-badge">
                      Live rate
                    </span>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* ── Category ──────────────────────── */}
          <div className="card p-5">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Category <span className="text-danger-500">*</span>
              {ocrAutoFilled && form.category && (
                <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">AI filled</span>
              )}
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
                {ocrAutoFilled && form.description && (
                  <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">AI filled</span>
                )}
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
                {ocrAutoFilled && (
                  <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">AI filled</span>
                )}
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
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {getCurrencySymbol(form.currencyCode)}
                      {Number(form.amount).toLocaleString()}
                    </p>
                    {isForeignCurrency && conversion && (
                      <p className="text-xs text-slate-500">
                        ≈ {getCurrencySymbol(companyCurrency)}{conversion.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}
