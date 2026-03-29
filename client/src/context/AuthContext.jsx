/**
 * SmartClaimr — Auth Context
 *
 * Provides authentication state management across the app.
 * Handles:
 *   - Persisted login state (localStorage token)
 *   - Auto-fetch user on app load
 *   - Login, signup, logout actions
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signup as apiSignup, login as apiLogin, getMe, logout as apiLogout, getToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * On mount: check for existing token and fetch user info
   */
  useEffect(() => {
    const token = getToken();
    if (token) {
      getMe()
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          // Token invalid or expired — clear it
          apiLogout();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Signup — creates company + admin user
   */
  const signup = useCallback(async (formData) => {
    setError(null);
    try {
      const data = await apiSignup(formData);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Login — validates credentials
   */
  const login = useCallback(async (formData) => {
    setError(null);
    try {
      const data = await apiLogin(formData);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Logout — clear token and user
   */
  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setError(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
