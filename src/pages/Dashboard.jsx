import { useAuthContext } from '../context/AuthContext';
import { getSalesHistory } from '../services/salesService';
import { products } from '../data/products';
import StatCard from '../components/StatCard';
import SimpleChart from '../components/SimpleChart';
import { formatCurrency } from '../utils/formatCurrency';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const { user } = useAuthContext();
  const [salesHistory, setSalesHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setSalesHistory(getSalesHistory());
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const totalSales = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = salesHistory.length;
  const lowStockItems = products.filter((p) => p.stock <= 20).length;
  const totalProducts = products.length;

  const today = new Date().toDateString();
  const todaySales = salesHistory.filter(
    (sale) => new Date(sale.date).toDateString() === today
  );
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  // Chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const daySales = salesHistory.filter(
      (sale) => new Date(sale.date).toDateString() === date.toDateString()
    );
    return {
      label: date.toLocaleDateString('en', { weekday: 'short' }),
      value: daySales.reduce((sum, sale) => sum + sale.total, 0),
    };
  });

  const categoryData = [
    { label: 'Beverages', value: products.filter(p => p.category === 'Beverages').length },
    { label: 'Groceries', value: products.filter(p => p.category === 'Groceries').length },
    { label: 'Pharmacy', value: products.filter(p => p.category === 'Pharmacy').length },
  ];

  const recentActivity = salesHistory.slice(0, 5).map(sale => ({
    id: sale.id,
    type: 'sale',
    message: `Sale completed - ${sale.items.length} items`,
    amount: sale.total,
    time: new Date(sale.date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    cashier: sale.cashier,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-5 h-32 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name} 👋</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          System Online
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(todayRevenue)}
          subtitle={`${todaySales.length} transactions`}
          icon={DollarSign}
          color="green"
          trend={12.5}
        />
        <StatCard
          title="Total Sales"
          value={formatCurrency(totalSales)}
          subtitle="All time revenue"
          icon={TrendingUp}
          color="purple"
          trend={8.3}
        />
        <StatCard
          title="Total Products"
          value={totalProducts.toLocaleString()}
          subtitle={`${lowStockItems} need restock`}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Low Stock Alert"
          value={lowStockItems}
          subtitle="Items running low"
          icon={AlertTriangle}
          color="orange"
          trend={-5.2}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sales Overview</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days revenue</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
              <ArrowUpRight className="w-4 h-4" />
              +12.5%
            </div>
          </div>
          <div className="h-64">
            <SimpleChart data={last7Days} type="line" color="#7c3aed" />
          </div>
        </div>

        {/* Category Chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Categories</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Product distribution</p>
            </div>
          </div>
          <div className="h-48">
            <SimpleChart data={categoryData} type="bar" color="#10b981" />
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map(cat => (
              <div key={cat.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{cat.label}</span>
                <span className="font-bold text-gray-900 dark:text-white">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Sales Table */}
        <div className="card p-0 lg:col-span-2 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
            <button className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-5 py-3 font-medium">Receipt</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Cashier</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {salesHistory.slice(0, 8).map((sale, idx) => (
                  <tr 
                    key={sale.id} 
                    className="border-b border-gray-50 dark:border-gray-700 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <td className="px-5 py-3 font-medium text-purple-700 dark:text-purple-400">{sale.id}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium">
                        {sale.items.length} items
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-gray-900 dark:text-white">{formatCurrency(sale.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.paymentMethod === 'Cash' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        sale.paymentMethod === 'Card' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                      }`}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{sale.cashier}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-500 text-xs">
                      {new Date(sale.date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card p-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{activity.cashier}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(activity.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;