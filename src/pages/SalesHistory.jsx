import { useState } from 'react';
import { getSalesHistory } from '../services/salesService';
import { formatCurrency } from '../utils/formatCurrency';
import Receipt from '../components/Receipt';
import { Search, Calendar, Eye, Printer } from 'lucide-react';

const SalesHistory = () => {
  const [selectedSale, setSelectedSale] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

 const salesHistory = getSalesHistory();
const filtered = salesHistory.filter((sale) => {
    const matchesSearch = sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.cashier.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (dateFilter === 'all') return matchesSearch;
    
    const saleDate = new Date(sale.date);
    const today = new Date();
    
    if (dateFilter === 'today') {
      return matchesSearch && saleDate.toDateString() === today.toDateString();
    }
    if (dateFilter === 'week') {
      const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
      return matchesSearch && saleDate >= weekAgo;
    }
    if (dateFilter === 'month') {
      return matchesSearch && saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear();
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
        <p className="text-sm text-gray-500">View and reprint receipts</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by receipt # or cashier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All Time' },
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setDateFilter(filter.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateFilter === filter.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
                <th className="px-5 py-3 font-medium">Receipt #</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Subtotal</th>
                <th className="px-5 py-3 font-medium">Discount</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Cashier</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sale) => (
                <tr key={sale.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-purple-700">{sale.id}</td>
                  <td className="px-5 py-3 text-gray-600">{sale.items} items</td>
                  <td className="px-5 py-3 text-gray-600">{formatCurrency(sale.amount)}</td>
                  <td className="px-5 py-3 text-gray-600">-</td>
                  <td className="px-5 py-3 font-bold text-gray-900">{formatCurrency(sale.amount)}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{sale.cashier}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(sale.date).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Receipt Preview</h3>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <Receipt sale={selectedSale} cashierName={selectedSale.cashier} />
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => setSelectedSale(null)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;