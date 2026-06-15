import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ClipboardList,
  BarChart3,
  Pill,
  LogOut,
  Store,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout, isAdmin, isManager } = useAuthContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'cashier'] },
    { path: '/pos', label: 'POS', icon: ShoppingCart, roles: ['admin', 'manager', 'cashier'] },
    { path: '/products', label: 'Products', icon: Package, roles: ['admin', 'manager'] },
    { path: '/inventory', label: 'Inventory', icon: ClipboardList, roles: ['admin', 'manager'] },
    { path: '/sales', label: 'Sales', icon: BarChart3, roles: ['admin', 'manager', 'cashier'] },
    { path: '/pharmacy', label: 'Pharmacy', icon: Pill, roles: ['admin', 'manager', 'cashier'] },
    { path: '/users', label: 'Users', icon: Users, roles: ['admin'] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition-all"
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside 
        className={`h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 text-white flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out shadow-2xl ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Header */}
        <div className={`p-6 border-b border-purple-700/50 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'hidden' : 'flex'}`}>
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Store className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Store-Wise</h1>
              <p className="text-[10px] text-purple-300 uppercase tracking-wider">POS System</p>
            </div>
          </div>
          
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-purple-300" />
            </button>
          )}
        </div>

        {/* Collapsed logo (only shows when collapsed) */}
        {isCollapsed && (
          <div className="p-4 flex justify-center border-b border-purple-700/50">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-purple-300" />
            </div>
          </div>
        )}

        {/* Expand button (only shows when collapsed) */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute -right-3 top-24 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-500 transition-colors z-50"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive ? 'bg-white/15 text-white shadow-lg shadow-purple-900/50' : 'text-purple-200 hover:bg-white/10 hover:text-white'} ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-purple-300 group-hover:text-white'} transition-colors`} />
                    {!isCollapsed && (
                      <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                    )}
                    {isActive && isCollapsed && (
                      <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-purple-700/50">
          {!isCollapsed ? (
            <>
              <div className="mb-3 px-3">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-purple-300 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-purple-200 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={logout}
              className="flex items-center justify-center w-full p-3 rounded-xl text-purple-200 hover:bg-white/10 hover:text-white transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;