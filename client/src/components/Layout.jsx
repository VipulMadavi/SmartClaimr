/**
 * Layout — Base layout wrapper with top navigation.
 * Shows nav links based on user role. Admin gets "Team" link.
 */

import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: '📊' },
  ];

  // Admin-only links
  if (user?.role === 'admin') {
    navLinks.push({ path: '/admin', label: 'Team', icon: '👥' });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Nav Links */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-bold">S</span>
                </div>
                <span className="text-lg font-bold text-slate-900 hidden sm:inline">
                  Smart<span className="text-gradient">Claimr</span>
                </span>
              </Link>

              {/* Nav Links */}
              <div className="flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                      <span className="text-base">{link.icon}</span>
                      <span className="hidden sm:inline">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User Info + Logout */}
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-700">{user.name}</span>
                    <span className="text-xs text-slate-400 capitalize">{user.role}</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <button
                    onClick={logout}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-all"
                    title="Sign out"
                    id="nav-logout-btn"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
