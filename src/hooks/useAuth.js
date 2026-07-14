import { useState, useCallback, useEffect } from 'react';
import { users } from '../data/users';

export const useAuth = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('storewise_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('storewise_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('storewise_user');
    }
  }, [user]);

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
    localStorage.removeItem('storewise_user');
    localStorage.removeItem('storewise_sales');
    localStorage.removeItem('storewise_cart');
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