import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit2,
  UserCheck,
  UserX,
  Lock,
  Mail,
  User as UserIcon,
  RefreshCw,
  Search,
  ShieldAlert
} from 'lucide-react';
import { authService } from '../services/authService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('TECHNICIAN');
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('TECHNICIAN');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPassword, setEditPassword] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Quick Action Toggling state
  const [togglingId, setTogglingId] = useState(null);

  // Fetch users from backend (Protected: ADMIN only, 403 Forbidden for Technicians)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await authService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      if (err.response?.status === 403) {
        setError('HTTP 403 Forbidden: Access to user administration is strictly restricted to ADMIN users.');
      } else {
        setError(
          err.response?.data?.detail ||
          'Failed to retrieve laboratory user directory from backend server.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 1. Create User Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');

    // Validation
    if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim()) {
      setAddError('Please fill in all required fields (username, email, password, role).');
      return;
    }

    if (newPassword.length < 6) {
      setAddError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setAddSubmitting(true);
      const created = await authService.createUser({
        username: newUsername.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: newRole,
        is_active: true
      });

      setAddSuccess(`User '${created.username}' created successfully!`);
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('TECHNICIAN');

      await fetchUsers();
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess('');
      }, 1200);
    } catch (err) {
      console.error('Create user error:', err);
      setAddError(
        err.response?.data?.detail ||
        'Failed to create user account. Username or email address may already be in use.'
      );
    } finally {
      setAddSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (userToEdit) => {
    setEditingUser(userToEdit);
    setEditUsername(userToEdit.username);
    setEditEmail(userToEdit.email);
    setEditRole(userToEdit.role);
    setEditIsActive(userToEdit.is_active);
    setEditPassword('');
    setEditError('');
    setEditSuccess('');
  };

  // 2. Edit User Handler
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditError('');
    setEditSuccess('');

    if (!editUsername.trim() || !editEmail.trim()) {
      setEditError('Username and email address cannot be empty.');
      return;
    }

    if (editPassword && editPassword.length < 6) {
      setEditError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setEditSubmitting(true);
      const payload = {
        username: editUsername.trim(),
        email: editEmail.trim(),
        role: editRole,
        is_active: editIsActive,
        ...(editPassword.trim() && { password: editPassword.trim() })
      };

      const updated = await authService.updateUser(editingUser.id, payload);
      setEditSuccess(`User '${updated.username}' updated successfully!`);

      await fetchUsers();
      setTimeout(() => {
        setEditingUser(null);
        setEditSuccess('');
      }, 1200);
    } catch (err) {
      console.error('Update user error:', err);
      setEditError(
        err.response?.data?.detail ||
        'Failed to update user profile. Username or email may already be taken.'
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  // 3. Quick Activate/Deactivate Toggle
  const handleToggleActive = async (targetUser) => {
    try {
      setTogglingId(targetUser.id);
      await authService.updateUser(targetUser.id, {
        is_active: !targetUser.is_active
      });
      await fetchUsers();
    } catch (err) {
      console.error('Toggle status error:', err);
      alert(err.response?.data?.detail || 'Failed to change account status.');
    } finally {
      setTogglingId(null);
    }
  };

  // Filtered users for search
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  if (loading) {
    return <Loading message="Loading laboratory user directory..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <ErrorMessage message={error} onRetry={fetchUsers} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Header & Actions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                User Management Directory
              </h1>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                ADMIN ONLY
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage operator accounts, assign roles (ADMIN / TECHNICIAN) and control access status
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            setAddError('');
            setAddSuccess('');
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Create New User</span>
        </button>
      </div>

      {/* 2. Search & Directory Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by username, email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
        <div className="text-xs font-bold text-slate-500 text-right shrink-0">
          Total Users: <strong className="text-slate-900">{filteredUsers.length}</strong>
        </div>
      </div>

      {/* 3. User Directory Table (Never displaying password hashes) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <EmptyState
              title="No Users Found"
              description="No user accounts match your search parameters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 pl-5">Username</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Registered Date</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Username */}
                    <td className="p-3.5 pl-5 font-bold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
                          <UserIcon className="h-3.5 w-3.5" />
                        </div>
                        <span>{u.username}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-3.5 text-slate-600 font-medium">{u.email}</td>

                    {/* Role */}
                    <td className="p-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        u.role === 'ADMIN'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {u.role === 'ADMIN' && <Shield className="h-3 w-3 mr-1 text-emerald-600" />}
                        {u.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={togglingId === u.id}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          u.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        }`}
                        title="Click to toggle active status"
                      >
                        {togglingId === u.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                        ) : u.is_active ? (
                          <UserCheck className="h-3 w-3 mr-1 text-emerald-600" />
                        ) : (
                          <UserX className="h-3 w-3 mr-1 text-red-600" />
                        )}
                        <span>{u.is_active ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>

                    {/* Registered Date */}
                    <td className="p-3.5 text-slate-500 font-medium whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-bold inline-flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE NEW USER                                 */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Create New Laboratory User</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {addSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{addSuccess}</span>
              </div>
            )}

            {addError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">Username *</label>
                <div className="relative">
                  <UserIcon className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. jdoe"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. jdoe@labtrackpro.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">Role *</label>
                <div className="relative">
                  <Shield className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="TECHNICIAN">TECHNICIAN (Barcode scan & sample tracking)</option>
                    <option value="ADMIN">ADMIN (Full system & user management privileges)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {addSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{addSubmitting ? 'Creating User...' : 'Create User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT USER (Role, Status, Email, Password)       */}
      {/* ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <Edit2 className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Edit User Profile</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{editSuccess}</span>
              </div>
            )}

            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-3.5 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">Role *</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="TECHNICIAN">TECHNICIAN</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">Account Status</label>
                  <select
                    value={editIsActive ? 'active' : 'disabled'}
                    onChange={(e) => setEditIsActive(e.target.value === 'active')}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to keep existing password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {editSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
