/**
 * UserCard — Displays a single user with role badge, manager info, and action buttons.
 *
 * Props:
 *   user        — { id, name, email, role, manager_name, created_at }
 *   onEdit      — callback when edit is triggered
 *   onDelete    — callback when delete is triggered
 *   isCurrentUser — true if this is the logged-in admin's own card
 */

const ROLE_CONFIG = {
  admin: {
    label: 'Admin',
    bgClass: 'bg-brand-100',
    textClass: 'text-brand-700',
    icon: '👑',
  },
  manager: {
    label: 'Manager',
    bgClass: 'bg-success-100',
    textClass: 'text-success-700',
    icon: '📋',
  },
  employee: {
    label: 'Employee',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-700',
    icon: '👤',
  },
};

export default function UserCard({ user, onEdit, onDelete, isCurrentUser }) {
  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.employee;

  // Get initials for avatar
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Avatar gradient based on role
  const avatarGradient =
    user.role === 'admin'
      ? 'from-brand-500 to-brand-700'
      : user.role === 'manager'
        ? 'from-success-500 to-success-700'
        : 'from-slate-400 to-slate-600';

  return (
    <div className="card p-5 group" id={`user-card-${user.id}`}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0 transition-transform group-hover:scale-105`}
        >
          {initials}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 truncate">
              {user.name}
              {isCurrentUser && (
                <span className="ml-2 text-xs text-slate-400 font-normal">(you)</span>
              )}
            </h3>
          </div>

          <p className="text-sm text-slate-500 truncate mb-2">{user.email}</p>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Role Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleConfig.bgClass} ${roleConfig.textClass}`}
            >
              <span>{roleConfig.icon}</span>
              {roleConfig.label}
            </span>

            {/* Manager Info */}
            {user.manager_name && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-50 text-slate-500 border border-slate-200">
                <span className="text-[10px]">↑</span>
                {user.manager_name}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {!isCurrentUser && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(user)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
              title="Edit user"
              id={`edit-user-${user.id}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(user)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-all"
              title="Delete user"
              id={`delete-user-${user.id}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Created date */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Added {new Date(user.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}
