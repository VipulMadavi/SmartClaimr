/**
 * AdminPage — User management panel for admins.
 *
 * Features:
 *   - Card-based user list with role badges
 *   - "Add User" modal (name, email, password, role dropdown, manager dropdown)
 *   - Edit user modal (change role, reassign manager)
 *   - Delete confirmation dialog
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import UserCard from '../components/UserCard';
import api from '../services/api';

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // ── Fetch users ──────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get('/users');
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Handlers ─────────────────────────
  const handleUserCreated = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
    setShowAddModal(false);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    setEditingUser(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await api.delete(`/users/${deletingUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Stats ────────────────────────────
  const usersByRole = {
    admin: users.filter((u) => u.role === 'admin').length,
    manager: users.filter((u) => u.role === 'manager').length,
    employee: users.filter((u) => u.role === 'employee').length,
  };

  // Manager/admin users available for assignment
  const managersAndAdmins = users.filter((u) => u.role === 'manager' || u.role === 'admin');

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* ── Page Header ──────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Team Management</h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage your company's users, roles, and reporting structure
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary gap-2"
            id="add-user-btn"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add User
          </button>
        </div>

        {/* ── Stats Row ────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Admins', count: usersByRole.admin, icon: '👑', color: 'brand' },
            { label: 'Managers', count: usersByRole.manager, icon: '📋', color: 'success' },
            { label: 'Employees', count: usersByRole.employee, icon: '👤', color: 'slate' },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <span className="text-2xl mb-1 block">{stat.icon}</span>
              <p className="text-2xl font-bold text-slate-900">{stat.count}</p>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Error ────────────────────────── */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger-50 border border-danger-100 animate-slide-down">
            <div className="flex items-center gap-2">
              <span className="text-danger-500 text-lg">⚠</span>
              <p className="text-sm text-danger-600 font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-danger-400 hover:text-danger-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ── User Grid ────────────────────── */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-36 mb-3" />
                    <div className="h-5 bg-slate-100 rounded-full w-20" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="h-3 bg-slate-100 rounded w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">👥</span>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No team members yet</h3>
            <p className="text-slate-500 text-sm mb-6">
              Add employees and managers to your company
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add Your First User
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user, i) => (
              <div
                key={user.id}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              >
                <UserCard
                  user={user}
                  isCurrentUser={user.id === currentUser?.id}
                  onEdit={setEditingUser}
                  onDelete={setDeletingUser}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add User Modal ─────────────────── */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleUserCreated}
          managersAndAdmins={managersAndAdmins}
        />
      )}

      {/* ── Edit User Modal ────────────────── */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={handleUserUpdated}
          managersAndAdmins={managersAndAdmins}
        />
      )}

      {/* ── Delete Confirmation ────────────── */}
      {deletingUser && (
        <DeleteConfirmModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </Layout>
  );
}

/* ══════════════════════════════════════════════
   Add User Modal
   ══════════════════════════════════════════════ */

function AddUserModal({ onClose, onSuccess, managersAndAdmins }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    managerId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
      if (formData.managerId) {
        payload.managerId = Number(formData.managerId);
      }

      const data = await api.post('/users', payload);
      onSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="card p-0 max-w-md w-full animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-brand-50 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add Team Member</h2>
              <p className="text-sm text-slate-500 mt-0.5">Invite a new user to your company</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-danger-50 border border-danger-100">
              <p className="text-sm text-danger-600">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="add-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              id="add-name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Jane Smith"
              className="input"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="add-email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              id="add-email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="jane@company.com"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="add-password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Initial Password
            </label>
            <input
              id="add-password"
              name="password"
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="add-role" className="block text-sm font-medium text-slate-700 mb-1.5">
                Role
              </label>
              <select
                id="add-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input cursor-pointer"
              >
                <option value="employee">👤 Employee</option>
                <option value="manager">📋 Manager</option>
                <option value="admin">👑 Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="add-manager" className="block text-sm font-medium text-slate-700 mb-1.5">
                Reports To
              </label>
              <select
                id="add-manager"
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                className="input cursor-pointer"
              >
                <option value="">None</option>
                {managersAndAdmins.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1"
              id="confirm-add-user-btn"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Adding...
                </span>
              ) : (
                'Add User'
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}

/* ══════════════════════════════════════════════
   Edit User Modal
   ══════════════════════════════════════════════ */

function EditUserModal({ user, onClose, onSuccess, managersAndAdmins }) {
  const [formData, setFormData] = useState({
    role: user.role,
    managerId: user.manager_id ? String(user.manager_id) : '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        role: formData.role,
        managerId: formData.managerId ? Number(formData.managerId) : null,
      };

      const data = await api.patch(`/users/${user.id}`, payload);
      onSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter out the user being edited from manager options
  const availableManagers = managersAndAdmins.filter((m) => m.id !== user.id);

  return (
    <ModalOverlay onClose={onClose}>
      <div className="card p-0 max-w-md w-full animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-brand-50 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Edit User</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Update role and manager for <span className="font-medium text-slate-700">{user.name}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-danger-50 border border-danger-100">
              <p className="text-sm text-danger-600">{error}</p>
            </div>
          )}

          {/* User info (read-only) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-xs">
                {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-role" className="block text-sm font-medium text-slate-700 mb-1.5">
                Role
              </label>
              <select
                id="edit-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input cursor-pointer"
              >
                <option value="employee">👤 Employee</option>
                <option value="manager">📋 Manager</option>
                <option value="admin">👑 Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-manager" className="block text-sm font-medium text-slate-700 mb-1.5">
                Reports To
              </label>
              <select
                id="edit-manager"
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                className="input cursor-pointer"
              >
                <option value="">None</option>
                {availableManagers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1"
              id="confirm-edit-user-btn"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}

/* ══════════════════════════════════════════════
   Delete Confirmation Modal
   ══════════════════════════════════════════════ */

function DeleteConfirmModal({ user, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="card p-0 max-w-sm w-full animate-slide-up overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-danger-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.902-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Delete User</h3>
          <p className="text-sm text-slate-500">
            Are you sure you want to remove <span className="font-semibold text-slate-700">{user.name}</span> from your team?
            This action cannot be undone.
          </p>
        </div>
        <div className="px-6 pb-6 flex items-center gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="btn-danger flex-1"
            id="confirm-delete-user-btn"
          >
            {deleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ══════════════════════════════════════════════
   Modal Overlay (backdrop)
   ══════════════════════════════════════════════ */

function ModalOverlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
