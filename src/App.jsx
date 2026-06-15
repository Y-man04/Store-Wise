import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { useAuthContext } from './context/AuthContext';
import AppLayout from './layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import SalesHistory from './pages/SalesHistory';
import Pharmacy from './pages/Pharmacy';
import Users from './pages/Users';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuthContext();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isLoggedIn } = useAuthContext();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="sales" element={<SalesHistory />} />
        <Route path="pharmacy" element={<Pharmacy />} />
        <Route
          path="products"
          element={
            <RoleRoute allowedRoles={['admin', 'manager']}>
              <Products />
            </RoleRoute>
          }
        />
        <Route
          path="inventory"
          element={
            <RoleRoute allowedRoles={['admin', 'manager']}>
              <Inventory />
            </RoleRoute>
          }
        />
        <Route
          path="users"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <Users />
            </RoleRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;