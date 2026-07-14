import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { users as defaultUsers } from '../data/users';

const AuthContext = createContext(null);
const USERS_KEY = 'storewise_users';
const SESSION_KEY = 'storewise_user';

const seedUsersIfNeeded = () => {
  const existing = localStorage.getItem(USERS_KEY);
  if (existing) return;
  const seeded = defaultUsers.map((u) => ({
    ...u,
    status: 'active',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  }));
  localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    seedUsersIfNeeded();
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load saved user:', e);
    }
    setIsLoading(false);
  }, []);

  const getAllUsers = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (e) {
      console.error('Failed to load stored users:', e);
      return [];
    }
  }, []);

  const saveAllUsers = (list) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  };

  const login = (emailOrUsername, password) => {
    const input = String(emailOrUsername || '').trim().toLowerCase();
    const allUsers = getAllUsers();
    const found = allUsers.find(
      (u) =>
        (String(u.email || '').toLowerCase() === input ||
          String(u.username || '').toLowerCase() === input) &&
        u.password === password
    );

    if (!found) {
      return { success: false, error: 'Invalid email/username or password' };
    }
    if (found.status === 'inactive') {
      return { success: false, error: 'This account has been deactivated. Contact your admin.' };
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(found));
    setUser(found);
    return { success: true, user: found };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  // ---------- Staff management (Users page is admin-gated by App.jsx) ----------

  const addStaff = ({ name, email, username, password, role }) => {
    const allUsers = getAllUsers();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedUsername = String(username || '').trim().toLowerCase();

    const clash = allUsers.some(
      (u) =>
        String(u.email || '').toLowerCase() === normalizedEmail ||
        String(u.username || '').toLowerCase() === normalizedUsername
    );
    if (clash) return { success: false, error: 'Email or username already in use' };

    const newStaff = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      password,
      role,
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: user?.id || 'unknown',
    };

    saveAllUsers([...allUsers, newStaff]);
    return { success: true, user: newStaff };
  };

  const updateStaff = (id, updates) => {
    const allUsers = getAllUsers();
    const idx = allUsers.findIndex((u) => u.id === id);
    if (idx === -1) return { success: false, error: 'Staff member not found' };

    const updated = { ...allUsers[idx], ...updates };
    allUsers[idx] = updated;
    saveAllUsers(allUsers);

    if (user?.id === id) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      setUser(updated);
    }
    return { success: true, user: updated };
  };

  const setStaffStatus = (id, status) => {
    if (id === user?.id) return { success: false, error: "You can't deactivate your own account" };
    return updateStaff(id, { status });
  };

  const resetPassword = (id, newPassword) => {
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }
    return updateStaff(id, { password: newPassword });
  };

  const deleteStaff = (id) => {
    if (id === user?.id) return { success: false, error: "You can't delete your own account" };
    const allUsers = getAllUsers();
    const target = allUsers.find((u) => u.id === id);
    if (!target) return { success: false, error: 'Staff member not found' };
    saveAllUsers(allUsers.filter((u) => u.id !== id));
    return { success: true };
  };

  const value = {
    user,
    role: user?.role || null,
    login,
    logout,
    getAllUsers,
    addStaff,
    updateStaff,
    setStaffStatus,
    resetPassword,
    deleteStaff,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isCashier: user?.role === 'cashier',
    isLoggedIn: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};