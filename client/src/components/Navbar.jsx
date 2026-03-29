/**
 * Navbar — Top navigation bar for desktop, bottom tab bar for mobile.
 *
 * Features:
 *   - Glassmorphism top bar with logo, nav links, user info
 *   - Mobile: bottom tab bar with icons
 *   - Smooth active-state indicator
 *   - Role-based navigation visibility
 */

import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: DashboardIcon, mobileLabel: 'Home' },
  ];

  if (user?.role === 'manager' || user?.role === 'admin') {
    navLinks.push({ path: '/approvals', label: 'Approvals', icon: ApprovalsIcon, mobileLabel: 'Approve' });
  }

  if (user?.role === 'admin') {
    navLinks.push({ path: '/admin', label: 'Team', icon: TeamIcon, mobileLabel: 'Team' });
  }

  // Get initials for avatar
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <>
      {/* ═══ Desktop Top Nav ═════════════════════════════════ */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/60" id="desktop-nav">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Nav Links */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 group-hover:shadow-md">
                  <span className="text-white text-sm font-bold">S</span>
                </div>
                <span className="text-lg font-bold text-slate-900 hidden sm:inline">
                  Smart<span className="text-gradient">Claimr</span>
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden sm:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                        ${isActive
                          ? 'bg-brand-50 text-brand-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                      <Icon className="w-4 h-4" active={isActive} />
                      <span>{link.label}</span>
                      {isActive && (
                        <span className="absolute -bottom-[1px] left-4 right-4 h-0.5 bg-brand-500 rounded-full" />
                      )}
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
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white transition-transform hover:scale-105">
                    {initials}
                  </div>
                  <button
                    onClick={logout}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-all"
                    title="Sign out"
                    id="nav-logout-btn"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ Mobile Bottom Tab Bar ═══════════════════════════ */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-slate-200/60 safe-bottom" id="mobile-nav">
        <div className="flex items-center justify-around h-16 px-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[60px]
                  ${isActive
                    ? 'text-brand-600'
                    : 'text-slate-400 active:text-slate-600'
                  }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-brand-50' : ''}`}>
                  <Icon className="w-5 h-5" active={isActive} />
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? 'text-brand-600' : 'text-slate-400'}`}>
                  {link.mobileLabel}
                </span>
              </Link>
            );
          })}
          {/* Profile/Logout on mobile */}
          <button
            onClick={logout}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-slate-400 active:text-danger-600 min-w-[60px] transition-all"
          >
            <div className="p-1.5 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══ Icon Components ═══════════════════════════════════════ */

function DashboardIcon({ className, active }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ApprovalsIcon({ className, active }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TeamIcon({ className, active }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
