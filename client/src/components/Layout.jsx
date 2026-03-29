/**
 * Layout — Base layout wrapper with top navigation placeholder.
 * Acts as the shell for all pages.
 */
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">S</span>
              </div>
              <span className="text-lg font-bold text-slate-900">
                Smart<span className="text-gradient">Claimr</span>
              </span>
            </div>

            {/* Placeholder for auth/user info — will be built in Phase 1 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
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
