import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ClipboardList,
  BarChart3,
  Pill,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCog,
  User,
  AlertTriangle,
  Wallet,
  Calendar
} from 'lucide-react';
import { isServiceType } from '../data/serviceTypes';

const roleBadgeStyles = {
  admin: 'bg-red-500/10 text-red-300 border-red-500/20',
  manager: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  cashier: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
};

const roleBadgeIcon = {
  admin: Shield,
  manager: UserCog,
  cashier: User,
};

const RoleBadge = ({ role }) => {
  const Icon = roleBadgeIcon[role] || User;
  const style = roleBadgeStyles[role] || roleBadgeStyles.cashier;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${style}`}>
      <Icon className="w-3 h-3" />
      {role || 'cashier'}
    </span>
  );
};

const AppLayout = () => {
  const { user, logout, role, isAdmin } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (location.state?.toast) {
      setToast(location.state.toast);
      const timer = setTimeout(() => setToast(null), 3500);
      navigate(location.pathname, { replace: true, state: {} });
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const business = (() => {
    try {
      return JSON.parse(localStorage.getItem('storewise_business') || '{}');
    } catch {
      return {};
    }
  })();
  const isSalon = business.type === 'salon';
  const isServiceBusiness = isServiceType(business.type);

  const baseNavItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'cashier'] },
    { path: '/pos', label: 'POS', icon: ShoppingCart, roles: ['admin', 'manager', 'cashier'] },
    { path: '/sales', label: role === 'cashier' ? 'My Sales' : 'Sales', icon: BarChart3, roles: ['admin', 'manager', 'cashier'] },
  ];

  // Product-only pages — hidden entirely for service businesses
  if (!isServiceBusiness) {
    baseNavItems.splice(2, 0, { path: '/products', label: 'Products', icon: Package, roles: ['admin', 'manager'] });
    baseNavItems.splice(3, 0, { path: '/inventory', label: 'Inventory', icon: ClipboardList, roles: ['admin', 'manager'] });
    baseNavItems.push({ path: '/pharmacy', label: 'Pharmacy', icon: Pill, roles: ['admin', 'manager'] });
  }

  // Service-only pages — hidden entirely for product businesses
  if (isSalon) {
    baseNavItems.splice(2, 0, { path: '/appointments', label: 'Appointments', icon: Calendar, roles: ['admin', 'manager', 'cashier'] });
  } else if (isServiceBusiness) {
    baseNavItems.splice(2, 0, { path: '/orders', label: 'Orders', icon: Wallet, roles: ['admin', 'manager', 'cashier'] });
  }

  const navItems = baseNavItems.filter((item) => item.roles.includes(role));

  const adminItems = [
    { path: '/users', label: 'Users', icon: Users },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen flex overflow-hidden bg-[#0a0a0f]">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg border border-orange-500/30 bg-[#1a1a24] px-4 py-3 shadow-2xl animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
          <span className="text-sm text-white">{toast}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-white/5 bg-[#0f0f16] transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/5">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="ml-3 overflow-hidden">
              <p className="font-bold text-white text-sm">Store-Wise</p>
              <p className="text-xs text-gray-500">POS System</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? 'bg-purple-600/20 text-purple-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                {sidebarOpen && (
                  <p className="px-3 text-xs text-gray-600 font-medium uppercase tracking-wider">Admin</p>
                )}
                {!sidebarOpen && <div className="mx-3 border-t border-white/5" />}
              </div>
              {adminItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      active
                        ? 'bg-purple-600/20 text-purple-400'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                    title={!sidebarOpen ? item.label : ''}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-white/5 space-y-1">
          {sidebarOpen && (
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <div className="mt-1">
                <RoleBadge role={role} />
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {sidebarOpen && <span className="text-sm">Collapse</span>}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-bold text-white">
            {navItems.find((n) => isActive(n.path))?.label ||
              adminItems.find((n) => isActive(n.path))?.label ||
              'Store-Wise'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
              <span className="text-sm font-bold text-purple-400">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;