/**
 * SmartClaimr — App Root
 *
 * Sets up routing and auth context.
 * Redirects to AuthPage when not logged in.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import Layout from './components/Layout';

/**
 * Dashboard placeholder — will be replaced in Phase 3
 */
function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-success-400 to-success-500 text-white text-3xl mb-6 shadow-lg">
            ✓
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Welcome, {user?.name}! 👋
          </h1>
          <p className="text-slate-500 mb-1">
            You're signed in as <span className="badge-role">{user?.role}</span> at{' '}
            <span className="font-semibold text-slate-700">{user?.companyName}</span>
          </p>
          <p className="text-sm text-slate-400 mb-8">
            Base currency: {user?.currencyCode}
          </p>

          <button
            onClick={logout}
            className="btn-ghost text-sm"
            id="logout-btn"
          >
            Sign Out
          </button>
        </div>

        {/* Feature preview cards */}
        <div className="grid sm:grid-cols-3 gap-6 mt-4">
          {[
            {
              icon: '💸',
              title: 'Submit Expenses',
              desc: 'Multi-currency support with OCR receipt scanning',
              color: 'from-brand-500/10 to-brand-600/5',
              phase: 'Phase 3',
            },
            {
              icon: '✅',
              title: 'Smart Approvals',
              desc: 'Configurable multi-level approval workflows',
              color: 'from-success-500/10 to-success-600/5',
              phase: 'Phase 4',
            },
            {
              icon: '🧠',
              title: 'AI Suggestions',
              desc: 'Intelligent flags for duplicates and anomalies',
              color: 'from-warning-500/10 to-warning-600/5',
              phase: 'Phase 6',
            },
          ].map((card, i) => (
            <div
              key={card.title}
              className="card p-6 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl mb-4`}
              >
                {card.icon}
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{card.title}</h3>
              <p className="text-sm text-slate-500 mb-3">{card.desc}</p>
              <span className="text-xs font-medium text-slate-400">Coming in {card.phase}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

/**
 * Protected Route wrapper — redirects to /auth if not logged in
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm mx-auto mb-4">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

/**
 * App Root
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthRoute />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

/**
 * Auth route — redirects to dashboard if already logged in
 */
function AuthRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <AuthPage />;
}

export default App;
