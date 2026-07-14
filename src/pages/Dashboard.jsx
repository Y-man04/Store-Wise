import { useAuthContext } from '../context/AuthContext';
import { getSalesHistory } from '../services/salesService';
import { products } from '../data/products';
import { formatCurrency } from '../utils/formatCurrency';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Receipt,
  AlertTriangle,
  ArrowRight,
  Plus,
  TrendingUp,
  Users,
  Pill,
  Store,
  ClipboardList,
  Clock,
  Calendar
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStoredOrders } from '../utils/orderStorage';
import { getStoredAppointments } from '../utils/appointmentStorage';

const Dashboard = () => {
  const { user } = useAuthContext();
  const [salesHistory, setSalesHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSalesHistory(getSalesHistory());
      setIsLoading(false);
    }, 300);

    const biz = localStorage.getItem('storewise_business');
    if (biz) setBusiness(JSON.parse(biz));

    return () => clearTimeout(timer);
  }, []);

  const today = new Date();
  const todayStr = today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todaySales = salesHistory.filter(
    (sale) => new Date(sale.date).toDateString() === todayStr
  );
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const todayCount = todaySales.length;

  const yesterdaySales = salesHistory.filter(
    (sale) => new Date(sale.date).toDateString() === yesterday.toDateString()
  );
  const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0);

  const revenueChange = yesterdayRevenue > 0 
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
    : 0;

  const lowStockItems = products.filter((p) => p.stock <= p.reorderLevel || p.stock <= 10);
  const expiringSoon = products.filter((p) => {
    if (!p.expiryDate) return false;
    const daysUntil = Math.ceil((new Date(p.expiryDate) - today) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil > 0;
  });

  // Service business stats
  const isServiceBusiness = ['tailoring', 'salon', 'laundry', 'other_service'].includes(business?.type);
  const isSalon = business?.type === 'salon';

  const [serviceStats, setServiceStats] = useState({ pending: 0, overdue: 0, todayAppointments: 0 });

  useEffect(() => {
    if (!isServiceBusiness) return;

    const todayISO = today.toISOString().slice(0, 10);

    if (isSalon) {
      const appointments = getStoredAppointments();
      const todayAppts = appointments.filter(a => a.date === todayISO && a.status !== 'Cancelled');
      setServiceStats({
        pending: appointments.filter(a => a.status === 'Booked').length,
        overdue: 0,
        todayAppointments: todayAppts.length
      });
    } else {
      const orders = getStoredOrders();
      const pending = orders.filter(o => o.status !== 'Delivered').length;
      const overdue = orders.filter(o => {
        if (!o.dueDate || o.status === 'Delivered') return false;
        return o.dueDate < todayISO;
      }).length;
      setServiceStats({ pending, overdue, todayAppointments: 0 });
    }
  }, [isServiceBusiness, isSalon, business]);

  const recentSales = salesHistory.slice(0, 5);
  const lastSale = recentSales[0];

  const isCashier = user?.role === 'cashier';
  const isManager = user?.role === 'manager';
  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    if (isCashier) {
      const ownSales = salesHistory.filter((s) => s.cashier === user?.name);
      const todayOwn = ownSales.filter((s) => new Date(s.date).toDateString() === todayStr);
      const todayOwnRevenue = todayOwn.reduce((sum, s) => sum + s.total, 0);
      const lastOwnSale = ownSales[0];

      return (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-white">Hi, {user?.name?.split(' ')[0] || 'there'}</h1>
            <p className="text-sm text-gray-500">
              {today.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          <Link to="/pos" className="card p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-purple-500/30 transition-colors group">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">Start Selling</h2>
              <p className="text-sm text-gray-400 mt-1">Tap to open the POS and process a sale</p>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="text-sm text-gray-500">Your Sales Today</p>
              <p className="text-2xl font-bold text-white mt-2">{formatCurrency(todayOwnRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">{todayOwn.length} transaction{todayOwn.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-gray-500">Your Last Sale</p>
              <p className="text-2xl font-bold text-white mt-2">{lastOwnSale ? formatCurrency(lastOwnSale.total) : '—'}</p>
              <p className="text-xs text-gray-500 mt-1">
                {lastOwnSale ? new Date(lastOwnSale.date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) : 'No sales yet'}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-5 h-28 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state for first-time users
  if (salesHistory.length === 0 && products.length <= 5) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome to Store-Wise</h1>
          <p className="text-sm text-gray-500 mt-1">{business?.name || user?.businessName || user?.name}</p>
        </div>

        <div className="card p-8 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Make your first sale</h2>
          <p className="text-sm text-gray-400 mb-6">
            Your store is set up. Add a few products, then process your first transaction.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/pos" className="btn btn-primary flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              New Sale
            </Link>
            {!isServiceBusiness && (
              <Link to="/products" className="btn btn-secondary flex items-center justify-center gap-2">
                <Package className="w-4 h-4" />
                Add Products
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
          <div className="card p-4 text-center">
            <Receipt className="w-5 h-5 text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Print receipts</p>
          </div>
          <div className="card p-4 text-center">
            <TrendingUp className="w-5 h-5 text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Track sales</p>
          </div>
          {!isServiceBusiness && (
            <div className="card p-4 text-center">
              <AlertTriangle className="w-5 h-5 text-gray-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Stock alerts</p>
            </div>
          )}
          {isServiceBusiness && (
            <div className="card p-4 text-center">
              <ClipboardList className="w-5 h-5 text-gray-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Manage orders</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with business info */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-4 h-4 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">
              {isCashier ? 'Start Selling' : (business?.name || 'Today at a Glance')}
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            {today.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
            {business?.address && ` • ${business.address}`}
          </p>
        </div>
        {isCashier && (
          <Link to="/pos" className="btn btn-primary flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            New Sale
          </Link>
        )}
      </div>

      {/* Primary Action for Cashiers */}
      {isCashier && (
        <Link to="/pos" className="card p-6 flex items-center justify-between hover:border-purple-500/30 transition-colors group block">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Point of Sale</h2>
              <p className="text-sm text-gray-400">Process transactions, apply discounts, print receipts</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
        </Link>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Today's Sales</p>
            {revenueChange !== 0 && (
              <span className={`text-xs font-medium ${revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(0)}% vs yesterday
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(todayRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">{todayCount} transaction{todayCount !== 1 ? 's' : ''}</p>
        </div>

        {/* Product-based stats */}
        {!isServiceBusiness && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Low Stock</p>
              {lowStockItems.length > 0 && (
                <span className="badge badge-red text-xs">{lowStockItems.length} items</span>
              )}
            </div>
            <p className="text-2xl font-bold text-white">{lowStockItems.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              {lowStockItems.length > 0 ? 'Need restocking soon' : 'All stocked up'}
            </p>
          </div>
        )}

        {/* Service-based stats */}
        {isServiceBusiness && !isSalon && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Pending Orders</p>
              {serviceStats.pending > 0 && (
                <span className="badge badge-blue text-xs">{serviceStats.pending} active</span>
              )}
            </div>
            <p className="text-2xl font-bold text-white">{serviceStats.pending}</p>
            <p className="text-xs text-gray-500 mt-1">
              {serviceStats.pending > 0 ? 'Jobs in progress' : 'No active jobs'}
            </p>
          </div>
        )}

        {isServiceBusiness && isSalon && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Today's Appointments</p>
              {serviceStats.todayAppointments > 0 && (
                <span className="badge badge-blue text-xs">{serviceStats.todayAppointments} booked</span>
              )}
            </div>
            <p className="text-2xl font-bold text-white">{serviceStats.todayAppointments}</p>
            <p className="text-xs text-gray-500 mt-1">
              {serviceStats.todayAppointments > 0 ? 'Appointments today' : 'No appointments today'}
            </p>
          </div>
        )}

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Last Sale</p>
            {lastSale && (
              <span className="text-xs text-gray-600">
                {new Date(lastSale.date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-white">
            {lastSale ? formatCurrency(lastSale.total) : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {lastSale ? `${lastSale.items.length} item${lastSale.items.length !== 1 ? 's' : ''} • ${lastSale.paymentMethod} • ${lastSale.cashier}` : 'No sales yet'}
          </p>
        </div>
      </div>

      {/* Service alerts */}
      {isServiceBusiness && !isSalon && serviceStats.overdue > 0 && (isManager || isAdmin) && (
        <div className="card p-4 border-l-4 border-l-red-500 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{serviceStats.overdue} order{serviceStats.overdue !== 1 ? 's' : ''} overdue</p>
              <p className="text-xs text-gray-400 mt-0.5">Past due date and not yet delivered</p>
            </div>
            <Link to="/orders" className="text-xs text-red-400 hover:text-red-300 font-medium whitespace-nowrap">
              View Orders
            </Link>
          </div>
        </div>
      )}

      {/* Product alerts */}
      {!isServiceBusiness && (lowStockItems.length > 0 || expiringSoon.length > 0) && (isManager || isAdmin) && (
        <div className="space-y-3">
          {lowStockItems.length > 0 && (
            <div className="card p-4 border-l-4 border-l-orange-500 bg-orange-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} running low</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {lowStockItems.slice(0, 3).map(p => p.name).join(', ')}
                    {lowStockItems.length > 3 && ` and ${lowStockItems.length - 3} more`}
                  </p>
                </div>
                <Link to="/inventory" className="text-xs text-orange-400 hover:text-orange-300 font-medium whitespace-nowrap">
                  View Inventory
                </Link>
              </div>
            </div>
          )}

          {expiringSoon.length > 0 && (
            <div className="card p-4 border-l-4 border-l-red-500 bg-red-500/5">
              <div className="flex items-start gap-3">
                <Pill className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{expiringSoon.length} product{expiringSoon.length !== 1 ? 's' : ''} expiring within 30 days</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {expiringSoon.slice(0, 3).map(p => p.name).join(', ')}
                    {expiringSoon.length > 3 && ` and ${expiringSoon.length - 3} more`}
                  </p>
                </div>
                <Link to="/pharmacy" className="text-xs text-red-400 hover:text-red-300 font-medium whitespace-nowrap">
                  Check Pharmacy
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Sales */}
        <div className="card p-0 lg:col-span-2 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Recent Sales</h2>
            <Link to="/sales" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              View All
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <div className="p-8 text-center">
              <Receipt className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No sales recorded yet</p>
              <Link to="/pos" className="text-xs text-purple-400 hover:text-purple-300 mt-2 inline-block">
                Make your first sale →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentSales.map((sale) => (
                <div 
                  key={sale.id} 
                  className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{sale.id}</p>
                      <p className="text-xs text-gray-500">
                        {sale.items.length} item{sale.items.length !== 1 ? 's' : ''} • {sale.cashier}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatCurrency(sale.total)}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(sale.date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white px-1">Quick Actions</h2>

          <Link to="/pos" className="card p-4 flex items-center gap-3 hover:border-white/10 transition-colors group">
            <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">New Sale</p>
              <p className="text-xs text-gray-500">POS checkout</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
          </Link>

          {!isServiceBusiness && (
            <Link to="/products" className="card p-4 flex items-center gap-3 hover:border-white/10 transition-colors group">
              <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Add Product</p>
                <p className="text-xs text-gray-500">Update inventory</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </Link>
          )}

          {isServiceBusiness && !isSalon && (
            <Link to="/orders" className="card p-4 flex items-center gap-3 hover:border-white/10 transition-colors group">
              <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">New Order</p>
                <p className="text-xs text-gray-500">Log a job</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </Link>
          )}

          {isSalon && (
            <Link to="/appointments" className="card p-4 flex items-center gap-3 hover:border-white/10 transition-colors group">
              <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">New Appointment</p>
                <p className="text-xs text-gray-500">Book a slot</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </Link>
          )}

          {!isServiceBusiness && (isManager || isAdmin) && (
            <Link to="/inventory" className="card p-4 flex items-center gap-3 hover:border-white/10 transition-colors group">
              <div className="w-9 h-9 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">Check Stock</p>
                <p className="text-xs text-gray-500">Low stock alerts</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-orange-400 transition-colors" />
            </Link>
          )}

          {isAdmin && (
            <Link to="/users" className="card p-4 flex items-center gap-3 hover:border-white/10 transition-colors group">
              <div className="w-9 h-9 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white group-hover:text-green-400 transition-colors">Manage Team</p>
                <p className="text-xs text-gray-500">Staff & roles</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-green-400 transition-colors" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;