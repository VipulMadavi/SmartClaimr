/**
 * ExpenseCard — Displays a single expense in a card format.
 *
 * Props:
 *   - expense: the expense object
 *   - variant: 'view' (default) or 'action' (shows approve/reject buttons)
 *   - onApprove: callback(comment) for approve action
 *   - onReject: callback(comment) for reject action
 *   - isProcessing: boolean, shows loading state on buttons
 *   - isRemoving: boolean, triggers exit animation
 *   - style: inline styles (for animation delays)
 */

import { useState } from 'react';

const CATEGORY_CONFIG = {
  food: { icon: '🍔', label: 'Food & Dining', color: 'from-orange-400 to-amber-500' },
  travel: { icon: '✈️', label: 'Travel', color: 'from-blue-400 to-cyan-500' },
  lodging: { icon: '🏨', label: 'Lodging', color: 'from-violet-400 to-purple-500' },
  transport: { icon: '🚕', label: 'Transport', color: 'from-emerald-400 to-teal-500' },
  office_supplies: { icon: '📎', label: 'Office Supplies', color: 'from-slate-400 to-gray-500' },
  software: { icon: '💻', label: 'Software', color: 'from-indigo-400 to-blue-500' },
  entertainment: { icon: '🎬', label: 'Entertainment', color: 'from-pink-400 to-rose-500' },
  communication: { icon: '📱', label: 'Communication', color: 'from-sky-400 to-blue-500' },
  other: { icon: '📋', label: 'Other', color: 'from-gray-400 to-slate-500' },
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', className: 'badge-pending' },
  approved: { label: 'Approved', className: 'badge-approved' },
  rejected: { label: 'Rejected', className: 'badge-rejected' },
};

/**
 * Format currency amount
 */
function formatAmount(amount, currencyCode = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

/**
 * Format date string
 */
function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function ExpenseCard({
  expense,
  variant = 'view',
  onApprove,
  onReject,
  isProcessing = false,
  isRemoving = false,
  style,
}) {
  const category = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.other;
  const status = STATUS_CONFIG[expense.status] || STATUS_CONFIG.pending;
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);

  // High-value threshold marker
  const isHighValue = expense.amount >= 5000;

  return (
    <div
      className={`card p-5 animate-slide-up transition-all duration-400
        ${isRemoving ? 'opacity-0 scale-95 -translate-x-8' : ''}
      `}
      style={{
        ...style,
        ...(isRemoving ? { transition: 'all 400ms ease-out' } : {}),
      }}
    >
      <div className="flex items-start gap-4">
        {/* Category Icon */}
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-lg flex-shrink-0 shadow-sm`}
        >
          {category.icon}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: category + status */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-700 truncate">
              {category.label}
            </h3>
            <div className="flex items-center gap-2">
              {variant === 'action' && isHighValue && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                  ⚡ High Value
                </span>
              )}
              <span className={status.className}>{status.label}</span>
            </div>
          </div>

          {/* Description */}
          {expense.description && (
            <p className="text-sm text-slate-500 truncate mb-2">
              {expense.description}
            </p>
          )}

          {/* Bottom row: date + employee name (for managers/admins) */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(expense.expense_date)}
            </span>
            {expense.employee_name && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {expense.employee_name}
              </span>
            )}
          </div>

          {/* Approval history (for action variant) */}
          {variant === 'action' && expense.approvals && expense.approvals.length > 0 && (
            <div className="mt-2 space-y-1">
              {expense.approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-success-50 text-success-600"
                >
                  <span>✓</span>
                  <span>
                    {approval.approver_name} ({approval.approver_role}) approved
                    {approval.comment ? ` — "${approval.comment}"` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* AI Suggestion placeholder — Phase 6 */}
          {expense.ai_suggestion && (
            <div className="mt-2 text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-600">
              <span>🧠</span>
              <span>{expense.ai_suggestion}</span>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-slate-900">
            {formatAmount(expense.amount, expense.currency_code)}
          </p>
          {expense.amount_in_company_currency && expense.currency_code !== 'INR' && (
            <p className="text-xs text-slate-400 mt-0.5">
              ≈ {formatAmount(expense.amount_in_company_currency, 'INR')}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons — approve/reject */}
      {variant === 'action' && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          {/* Optional comment toggle & input */}
          <div className="mb-3">
            <button
              onClick={() => setShowComment(!showComment)}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
              type="button"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {showComment ? 'Hide comment' : 'Add comment'}
            </button>
            {showComment && (
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional comment..."
                className="input mt-2 text-xs py-2"
                maxLength={200}
              />
            )}
          </div>

          {/* Approve / Reject buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onApprove && onApprove(comment)}
              disabled={isProcessing}
              className="btn-success flex-1 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              id={`approve-btn-${expense.id}`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                '✓ Approve'
              )}
            </button>
            <button
              onClick={() => onReject && onReject(comment)}
              disabled={isProcessing}
              className="btn-danger flex-1 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              id={`reject-btn-${expense.id}`}
            >
              ✕ Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { CATEGORY_CONFIG, STATUS_CONFIG, formatAmount, formatDate };
