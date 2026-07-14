import Appointments from './pages/Appointments';
import OrdersRouter from './pages/OrdersRouter';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppLayout from './layout/AppLayout';
import About from './pages/About';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import SalesHistory from './pages/SalesHistory';
import Pharmacy from './pages/Pharmacy';
import Users from './pages/Users';
import Settings from './pages/Settings';
import AdminApplications from './pages/AdminApplications';

const AuthLoading = () => (
  <div className="h-screen flex items-center justify-center bg-[#0a0a0f]">
    <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuthContext();
  if (isLoading) return <AuthLoading />;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isLoggedIn, isLoading } = useAuthContext();
  if (isLoading) return <AuthLoading />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  const userRole = String(user?.role || '').toLowerCase();
  const allowed = allowedRoles.map((r) => String(r).toLowerCase());
  if (!allowed.includes(userRole)) {
    return <Navigate to="/" replace state={{ toast: "You don't have permission to view that page" }} />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/admin/applications" element={<AdminApplications />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="sales" element={<SalesHistory />} />
        <Route path="pharmacy" element={<Pharmacy />} />
        <Route path="products" element={<RoleRoute allowedRoles={['admin', 'manager']}><Products /></RoleRoute>} />
        <Route path="inventory" element={<RoleRoute allowedRoles={['admin', 'manager']}><Inventory /></RoleRoute>} />
        <Route path="users" element={<RoleRoute allowedRoles={['admin']}><Users /></RoleRoute>} />
        <Route path="settings" element={<RoleRoute allowedRoles={['admin']}><Settings /></RoleRoute>} />
        <Route path="orders" element={<OrdersRouter />} />
        <Route path="appointments" element={<Appointments />} />
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