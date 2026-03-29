/**
 * SmartClaimr — Auth Page
 *
 * Dual-mode form: Signup (creates company + admin) / Login.
 * Fintech-style design with smooth transitions.
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CURRENCIES = [
  { code: 'INR', label: '🇮🇳 INR — Indian Rupee' },
  { code: 'USD', label: '🇺🇸 USD — US Dollar' },
  { code: 'EUR', label: '🇪🇺 EUR — Euro' },
  { code: 'GBP', label: '🇬🇧 GBP — British Pound' },
  { code: 'AED', label: '🇦🇪 AED — UAE Dirham' },
  { code: 'SGD', label: '🇸🇬 SGD — Singapore Dollar' },
  { code: 'AUD', label: '🇦🇺 AUD — Australian Dollar' },
  { code: 'CAD', label: '🇨🇦 CAD — Canadian Dollar' },
  { code: 'JPY', label: '🇯🇵 JPY — Japanese Yen' },
];

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    country: 'India',
    currencyCode: 'INR',
  });
  const [submitting, setSubmitting] = useState(false);
  const { signup, login, error, clearError } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignup) {
        await signup(formData);
      } else {
        await login({ email: formData.email, password: formData.password });
      }
    } catch {
      // Error is handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/30 to-slate-50 flex flex-col">
      {/* ── Header ───────────────────────────── */}
      <div className="p-6">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-brand">
              <span className="text-white text-sm font-bold">S</span>
            </div>
          </div>
          <span className="text-xl font-bold text-slate-900">
            Smart<span className="text-gradient">Claimr</span>
          </span>
        </div>
      </div>

      {/* ── Main Content ─────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              {isSignup ? 'Create your workspace' : 'Welcome back'}
            </h1>
            <p className="text-slate-500">
              {isSignup
                ? 'Set up your company and start managing expenses'
                : 'Sign in to your SmartClaimr account'}
            </p>
          </div>

          {/* ── Error Alert ──────────────────── */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger-50 border border-danger-100 animate-slide-down">
              <div className="flex items-center gap-2">
                <span className="text-danger-500 text-lg">⚠</span>
                <p className="text-sm text-danger-600 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* ── Form Card ────────────────────── */}
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Signup-only fields */}
              {isSignup && (
                <>
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="input"
                      autoComplete="name"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Company Name
                    </label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Acme Corp"
                      className="input"
                    />
                  </div>

                  {/* Country & Currency side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Country
                      </label>
                      <input
                        id="country"
                        name="country"
                        type="text"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="India"
                        className="input"
                      />
                    </div>
                    <div>
                      <label htmlFor="currencyCode" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Base Currency
                      </label>
                      <select
                        id="currencyCode"
                        name="currencyCode"
                        value={formData.currencyCode}
                        onChange={handleChange}
                        className="input cursor-pointer"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="input"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="input"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3.5 text-base relative overflow-hidden"
                id="auth-submit-btn"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {isSignup ? 'Creating workspace...' : 'Signing in...'}
                  </span>
                ) : (
                  isSignup ? 'Create Workspace →' : 'Sign In →'
                )}
              </button>
            </form>
          </div>

          {/* ── Toggle Mode ──────────────────── */}
          <div className="text-center mt-6">
            <p className="text-sm text-slate-500">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-brand-600 font-semibold hover:text-brand-700 transition-colors"
                id="auth-toggle-btn"
              >
                {isSignup ? 'Sign in' : 'Create workspace'}
              </button>
            </p>
          </div>

          {/* ── Footer info ──────────────────── */}
          {isSignup && (
            <div className="mt-6 p-4 rounded-xl bg-brand-50 border border-brand-100">
              <div className="flex items-start gap-3">
                <span className="text-brand-500 text-lg mt-0.5">💡</span>
                <div>
                  <p className="text-sm font-medium text-brand-700">You'll be the admin</p>
                  <p className="text-xs text-brand-600 mt-0.5">
                    As the workspace creator, you'll have admin access. You can then invite employees and managers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
