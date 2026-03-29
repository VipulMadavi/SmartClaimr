/**
 * Toast — Global toast notification system.
 *
 * Uses React context so any component can show a toast via useToast().
 * Supports types: success, error, warning, info.
 * Auto-dismisses after configurable duration.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

const TOAST_CONFIG = {
  success: {
    bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    icon: '✓',
    iconBg: 'bg-white/20',
  },
  error: {
    bg: 'bg-gradient-to-r from-rose-500 to-rose-600',
    icon: '✕',
    iconBg: 'bg-white/20',
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-500 to-amber-600',
    icon: '⚠',
    iconBg: 'bg-white/20',
  },
  info: {
    bg: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
    icon: 'ℹ',
    iconBg: 'bg-white/20',
  },
};

/**
 * Single toast item
 */
function ToastItem({ toast, onDismiss }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration || 3500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-elevated text-white text-sm font-medium
        ${config.bg}
        ${isLeaving ? 'animate-toast-out' : 'animate-toast-in'}
        backdrop-blur-sm
      `}
      role="alert"
    >
      <span
        className={`w-6 h-6 rounded-lg ${config.iconBg} flex items-center justify-center text-xs flex-shrink-0`}
      >
        {config.icon}
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => {
          setIsLeaving(true);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="w-6 h-6 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0 opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * Toast provider — wrap your app with this
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container — fixed bottom-center */}
      {toasts.length > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90vw] max-w-md">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

/**
 * Hook to access toast functionality
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
