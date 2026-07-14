import { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import {
  Shield, User, UserCog, Users as UsersIcon, Plus, Pencil, Eye, EyeOff,
  KeyRound, Ban, CheckCircle2, Trash2, X
} from 'lucide-react';

const emptyForm = { name: '', email: '', username: '', password: '', role: 'cashier' };

const Users = () => {
  const { user: currentUser, getAllUsers, addStaff, updateStaff, setStaffStatus, resetPassword, deleteStaff } = useAuthContext();
  const [usersList, setUsersList] = useState([]);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const refresh = () => setUsersList(getAllUsers());

  useEffect(() => { refresh(); }, []);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-400" />;
      case 'manager': return <UserCog className="w-4 h-4 text-blue-400" />;
      default: return <User className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-300 border-red-500/20';
      case 'manager': return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      default: return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    }
  };

  const roleStats = useMemo(() => usersList.reduce(
    (acc, u) => {
      acc[u?.role || 'cashier'] = (acc[u?.role || 'cashier'] || 0) + 1;
      return acc;
    },
    { admin: 0, manager: 0, cashier: 0 }
  ), [usersList]);

  const openAdd = () => { setForm(emptyForm); setFormError(''); setEditingId(null); setModalMode('add'); };
  const openEdit = (u) => {
    setForm({ name: u.name || '', email: u.email || '', username: u.username || '', password: '', role: u.role || 'cashier' });
    setFormError(''); setEditingId(u.id); setModalMode('edit');
  };
  const closeModal = () => { setModalMode(null); setEditingId(null); setForm(emptyForm); setFormError(''); };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim() || !form.email.trim() || !form.username.trim()) {
      setFormError('Name, email, and username are required');
      return;
    }

    if (modalMode === 'add') {
      if (!form.password || form.password.length < 4) {
        setFormError('Password must be at least 4 characters');
        return;
      }
      const result = addStaff(form);
      if (!result.success) { setFormError(result.error); return; }
    } else if (modalMode === 'edit') {
      const updates = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        username: form.username.trim().toLowerCase(),
        role: form.role,
      };
      if (form.password) {
        if (form.password.length < 4) { setFormError('Password must be at least 4 characters'); return; }
        updates.password = form.password;
      }
      const result = updateStaff(editingId, updates);
      if (!result.success) { setFormError(result.error); return; }
    }

    refresh();
    closeModal();
  };

  const togglePasswordVisible = (id) => setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleToggleStatus = (u) => {
    const result = setStaffStatus(u.id, u.status === 'inactive' ? 'active' : 'inactive');
    if (!result.success) { alert(result.error); return; }
    refresh();
  };

  const handleResetPassword = (u) => {
    const newPassword = window.prompt(`New password for ${u.name}:`);
    if (!newPassword) return;
    const result = resetPassword(u.id, newPassword);
    if (!result.success) { alert(result.error); return; }
    refresh();
  };

  const handleDelete = (u) => {
    if (!window.confirm(`Permanently delete ${u.name}'s account? This can't be undone.`)) return;
    const result = deleteStaff(u.id);
    if (!result.success) { alert(result.error); return; }
    refresh();
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-gray-400">Manage staff accounts and roles.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300">
            <UsersIcon className="w-4 h-4 text-purple-400" />
            {usersList.length} {usersList.length === 1 ? 'account' : 'accounts'}
          </div>
          <button onClick={openAdd} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#12121a] p-4">
          <p className="text-sm text-gray-400">Admins</p>
          <p className="mt-2 text-2xl font-semibold text-white">{roleStats.admin}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#12121a] p-4">
          <p className="text-sm text-gray-400">Managers</p>
          <p className="mt-2 text-2xl font-semibold text-white">{roleStats.manager}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#12121a] p-4">
          <p className="text-sm text-gray-400">Cashiers</p>
          <p className="mt-2 text-2xl font-semibold text-white">{roleStats.cashier}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#12121a] shadow-2xl shadow-black/20">
        {usersList.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/20">
              <UsersIcon className="h-6 w-6 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">No staff accounts yet</h2>
            <p className="mt-2 max-w-md text-sm text-gray-400">Click "Add Staff" to create your first account.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-left text-gray-400">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Password</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const inactive = u.status === 'inactive';
                  return (
                    <tr key={u.id || u.email || u.username} className={`border-b border-white/5 hover:bg-white/5 ${inactive ? 'opacity-50' : ''}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600/20 text-sm font-bold text-purple-300">
                            {(u.name || u.username || u.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {u.name || u.username || u.email || 'Staff Member'}
                              {isSelf && <span className="ml-2 text-xs text-purple-400">(you)</span>}
                            </p>
                            <p className="text-xs text-gray-500">{u.username ? `@${u.username}` : 'No username'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-300">{u.email || '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 text-gray-300">
                          <span className="font-mono text-xs">{visiblePasswords[u.id] ? (u.password || '—') : '••••••••'}</span>
                          <button onClick={() => togglePasswordVisible(u.id)} className="text-gray-500 hover:text-white">
                            {visiblePasswords[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium ${getRoleColor(u.role)}`}>
                          {getRoleIcon(u.role)}
                          <span className="capitalize">{u.role || 'cashier'}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${inactive ? 'bg-gray-500/10 text-gray-400' : 'bg-emerald-500/10 text-emerald-300'}`}>
                          {inactive ? 'Inactive' : 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(u)} title="Edit" className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleResetPassword(u)} title="Reset password" className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white">
                            <KeyRound className="w-4 h-4" />
                          </button>
                          {!isSelf && (
                            <button onClick={() => handleToggleStatus(u)} title={inactive ? 'Activate' : 'Deactivate'} className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white">
                              {inactive ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </button>
                          )}
                          {!isSelf && (
                            <button onClick={() => handleDelete(u)} title="Delete" className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12121a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{modalMode === 'add' ? 'Add Staff' : 'Edit Staff'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{formError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  {modalMode === 'add' ? 'Password' : 'New Password (leave blank to keep current)'}
                </label>
                <input type="text" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Role</label>
                <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  {modalMode === 'edit' && <option value="admin">Admin</option>}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">{modalMode === 'add' ? 'Create Account' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;