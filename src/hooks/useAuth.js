import { useState, useCallback } from 'react';
import { users } from '../data/users';

export const useAuth = () => {
  const [user, setUser] = useState(null);

  const login = useCallback((email, password) => {
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      setUser(found);
      return { success: true, user: found };
    }
    return { success: false, error: 'Invalid email or password' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isCashier = user?.role === 'cashier';

  return {
    user,
    login,
    logout,
    isAdmin,
    isManager,
    isCashier,
    isLoggedIn: !!user,
  };
};