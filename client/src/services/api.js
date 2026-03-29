/**
 * SmartClaimr — API Service
 *
 * Centralized fetch wrapper with JWT token management.
 * All API calls go through this module.
 */

const API_BASE = 'http://localhost:5000/api';

/**
 * Get the stored auth token
 */
export function getToken() {
  return localStorage.getItem('smartclaimr_token');
}

/**
 * Store the auth token
 */
export function setToken(token) {
  localStorage.setItem('smartclaimr_token', token);
}

/**
 * Remove the auth token
 */
export function removeToken() {
  localStorage.removeItem('smartclaimr_token');
}

/**
 * Core fetch wrapper with auth headers and error handling
 */
async function request(endpoint, options = {}) {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  // Parse JSON response
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ── Auth API ───────────────────────────────────

export async function signup({ name, email, password, companyName, country, currencyCode }) {
  const data = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, companyName, country, currencyCode }),
  });
  if (data.token) setToken(data.token);
  return data;
}

export async function login({ email, password }) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) setToken(data.token);
  return data;
}

export async function getMe() {
  return request('/auth/me');
}

export function logout() {
  removeToken();
}

// ── Generic API methods ────────────────────────

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),

  /**
   * Upload a file via FormData (multipart/form-data).
   * Does NOT set Content-Type — browser handles boundary.
   */
  upload: async (endpoint, formData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(data?.error || `Upload failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  },
};

export default api;
