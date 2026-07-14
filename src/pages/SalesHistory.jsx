import { useState, useEffect, useMemo } from 'react';
import { getSalesHistory } from '../services/salesService';
import { formatCurrency } from '../utils/formatCurrency';
import { Receipt, Search, Printer, Download, TrendingUp, User, Phone, Package, Wrench } from 'lucide-react';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSales(getSalesHistory());
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const filteredSales = sales.filter((sale) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      sale.id.toLowerCase().includes(query) ||
      sale.cashier.toLowerCase().includes(query) ||
      (sale.customerName && sale.customerName.toLowerCase().includes(query)) ||
      (sale.customerPhone && sale.customerPhone.includes(query));

    if (dateFilter === 'All') return matchesSearch;

    const saleDate = new Date(sale.date);
    const today = new Date();

    if (dateFilter === 'Today') {
      return matchesSearch && saleDate.toDateString() === today.toDateString();
    }
    if (dateFilter === 'Yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return matchesSearch && saleDate.toDateString() === yesterday.toDateString();
    }
    if (dateFilter === 'This Week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesSearch && saleDate >= weekAgo;
    }
    if (dateFilter === 'This Month') {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return matchesSearch && saleDate >= monthAgo;
    }
    return matchesSearch;
  });

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;
  const avgSale = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Product vs Service breakdown
  const productSales = filteredSales.filter(s => !s.customerName || s.customerName === 'Walk-in');
  const serviceSales = filteredSales.filter(s => s.customerName && s.customerName !== 'Walk-in');

  // 7-day chart data
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const daySales = sales.filter(s => new Date(s.date).toDateString() === dayStr);
      const dayTotal = daySales.reduce((sum, s) => sum + s.total, 0);
      days.push({
        label: d.toLocaleDateString('en', { weekday: 'short' }),
        total: dayTotal,
        count: daySales.length
      });
    }
    return days;
  }, [sales]);

  const maxChartValue = Math.max(...chartData.map(d => d.total), 1);

  // Export to CSV
  const handleExport = () => {
    const headers = ['Receipt ID', 'Date', 'Cashier', 'Customer', 'Phone', 'Items', 'Subtotal', 'Discount', 'Total', 'Payment', 'Change'];
    const rows = filteredSales.map(sale => [
      sale.id,
      new Date(sale.date).toLocaleString('en-NG'),
      sale.cashier,
      sale.customerName || 'Walk-in',
      sale.customerPhone || '',
      sale.items.length,
      sale.subtotal,
      sale.discount || 0,
      sale.total,
      sale.paymentMethod,
      sale.change || 0
    ]);
const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isServiceSale = (sale) => sale.customerName && sale.customerName !== 'Walk-in';

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="card p-5 h-96 skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales History</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalTransactions} transactions • {formatCurrency(totalRevenue)} total
          </p>
        </div>
        <button 
          onClick={handleExport}
          disabled={filteredSales.length === 0}
          className="btn btn-secondary flex items-center gap-2 disabled:opacity-30"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1">Transactions</p>
          <p className="text-2xl font-bold text-white">{totalTransactions}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1">Average Sale</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(avgSale)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1">Service Sales</p>
          <p className="text-2xl font-bold text-white">{serviceSales.length}</p>
          <p className="text-xs text-gray-600 mt-1">{productSales.length} product sales</p>
        </div>
      </div>

      {/* 7-Day Chart */}
      {sales.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-bold text-white">Last 7 Days</h2>
          </div>
          <div className="flex items-end gap-3 h-32">
            {chartData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-0.5">
                  {day.total > 0 && (
                    <span className="text-xs text-gray-400">{formatCurrency(day.total)}</span>
                  )}
                  <div 
                    className="w-full bg-purple-600/60 rounded-t-sm min-h-[4px] transition-all"
                    style={{ height: `${(day.total / maxChartValue) * 100}px` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{day.label}</span>
                {day.count > 0 && (
                  <span className="text-xs text-gray-600">{day.count}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by receipt, cashier, customer, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full sm:w-80"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Today', 'Yesterday', 'This Week', 'This Month'].map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                dateFilter === filter
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Table */}
      <div className="card p-0 overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No sales found</p>
            <p className="text-xs text-gray-600 mt-1">
              {sales.length === 0 ? 'Make your first sale in the POS' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-gray-500 bg-white/[0.02]">
                  <th className="px-5 py-3 font-medium">Receipt</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Cashier</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr 
                    key={sale.id} 
                    onClick={() => setSelectedSale(sale)}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {isServiceSale(sale) ? (
                          <Wrench className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <Package className="w-3.5 h-3.5 text-purple-400" />
                        )}
                        <span className="font-medium text-white">{sale.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {sale.customerName && sale.customerName !== 'Walk-in' ? (
                        <div>
                          <p className="text-sm text-white">{sale.customerName}</p>
                          {sale.customerPhone && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />{sale.customerPhone}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600">Walk-in</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge text-xs ${isServiceSale(sale) ? 'badge-blue' : 'badge-purple'}`}>
                        {sale.items.length} {isServiceSale(sale) ? 'services' : 'items'}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-white">{formatCurrency(sale.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${
                        sale.paymentMethod === 'Cash' ? 'badge-green' :
                        sale.paymentMethod === 'Transfer' ? 'badge-blue' :
                        'badge-purple'
                      } text-xs`}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{sale.cashier}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {new Date(sale.date).toLocaleDateString('en-NG', { 
                        day: 'numeric', 
                        month: 'short', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); window.print(); }}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Print receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: '#111118' }}>
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedSale.id}</h2>
                <p className="text-xs text-gray-500">
                  {new Date(selectedSale.date).toLocaleString('en-NG')}
                </p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="p-2 hover:bg-white/10 rounded-lg">
                <span className="text-gray-300 text-xl">&times;</span>
              </button>
            </div>

            <div className="p-5 space-y-5">
              {selectedSale.customerName && selectedSale.customerName !== 'Walk-in' && (
                <div className="card p-3 space-y-1" style={{ backgroundColor: '#0e0e14' }}>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-white font-medium">{selectedSale.customerName}</span>
                  </div>
                  {selectedSale.customerPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">{selectedSale.customerPhone}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {selectedSale.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-white">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} x {formatCurrency(item.price)}</p>
                    </div>
                    <p className="text-white font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="card p-4 space-y-2" style={{ backgroundColor: '#0e0e14' }}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatCurrency(selectedSale.subtotal)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Discount</span>
                    <span className="text-green-400">-{formatCurrency(selectedSale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                  <span className="text-white">Total</span>
                  <span className="text-white">{formatCurrency(selectedSale.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Paid ({selectedSale.paymentMethod})</span>
                  <span className="text-white">{formatCurrency(selectedSale.amountTendered)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Change</span>
                  <span className="text-green-400 font-bold">{formatCurrency(selectedSale.change)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
                <button 
                  onClick={() => setSelectedSale(null)}
                  className="btn btn-primary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;