/**
 * ExpenseCard — Displays a single expense in a card format.
 *
 * Props:
 *   - expense: the expense object
 *   - variant: 'view' (default) or 'action' (shows approve/reject buttons — Phase 4)
 *   - onApprove: callback for approve action (Phase 4)
 *   - onReject: callback for reject action (Phase 4)
 *   - style: inline styles (for animation delays)
 */

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

export default function ExpenseCard({ expense, variant = 'view', style }) {
  const category = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.other;
  const status = STATUS_CONFIG[expense.status] || STATUS_CONFIG.pending;

  return (
    <div
      className="card p-5 animate-slide-up"
      style={style}
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
            <span className={status.className}>{status.label}</span>
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

      {/* Action buttons — Phase 4 approve/reject */}
      {variant === 'action' && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          <button className="btn-success flex-1 py-2 text-xs">
            ✓ Approve
          </button>
          <button className="btn-danger flex-1 py-2 text-xs">
            ✕ Reject
          </button>
        </div>
      )}
    </div>
  );
}

export { CATEGORY_CONFIG, STATUS_CONFIG, formatAmount, formatDate };
