/**
 * Layout — Base layout wrapper with Navbar (top + mobile bottom).
 * Provides consistent page structure and handles mobile bottom padding.
 */

import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <Navbar />

      {/* Page Content — add bottom padding on mobile for bottom nav */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-8">
        {children}
      </main>
    </div>
  );
}
