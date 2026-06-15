import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { users } from '../data/users';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('storewise_user');
    return saved ? JSON.parse(saved) : null;
  });

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
  }, []);

  const value = {
    user,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isCashier: user?.role === 'cashier',
    isLoggedIn: !!user,
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