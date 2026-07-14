import { useState } from 'react';
import { products } from '../data/products';
import { formatCurrency } from '../utils/formatCurrency';
import { AlertTriangle, Calendar, Pill, Search } from 'lucide-react';

const Pharmacy = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const pharmacyItems = products.filter((p) => p.category === 'Pharmacy');

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { text: 'N/A', class: 'badge-gray' };
    const daysUntil = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return { text: 'Expired', class: 'badge-red' };
    if (daysUntil <= 30) return { text: `${daysUntil}d left`, class: 'badge-red' };
    if (daysUntil <= 90) return { text: `${daysUntil}d left`, class: 'badge-orange' };
    return { text: `${daysUntil}d left`, class: 'badge-green' };
  };

  const expiredCount = pharmacyItems.filter((p) => {
    if (!p.expiryDate) return false;
    return new Date(p.expiryDate) < new Date();
  }).length;

  const criticalCount = pharmacyItems.filter((p) => {
    if (!p.expiryDate) return false;
    const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 30;
  }).length;

  const soonCount = pharmacyItems.filter((p) => {
    if (!p.expiryDate) return false;
    const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 30 && days <= 90;
  }).length;

  const filteredItems = pharmacyItems.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.batchNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'All') return matchesSearch;
    if (filter === 'Expired') {
      if (!p.expiryDate) return false;
      return matchesSearch && new Date(p.expiryDate) < new Date();
    }
    if (filter === 'Critical') {
      if (!p.expiryDate) return false;
      const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return matchesSearch && days >= 0 && days <= 30;
    }
    if (filter === 'Expiring Soon') {
      if (!p.expiryDate) return false;
      const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return matchesSearch && days > 30 && days <= 90;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pharmacy</h1>
          <p className="text-sm text-gray-500 mt-1">{pharmacyItems.length} drugs tracked</p>
        </div>
      </div>

      {/* Alert Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-l-red-500 bg-red-500/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-xl font-bold text-white">{expiredCount}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-orange-500 bg-orange-500/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Critical (≤30 days)</p>
              <p className="text-xl font-bold text-white">{criticalCount}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-yellow-500 bg-yellow-500/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Expiring Soon (31-90d)</p>
              <p className="text-xl font-bold text-white">{soonCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search drugs or batch number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full sm:w-80"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Expired', 'Critical', 'Expiring Soon'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Drug Table */}
      <div className="card p-0 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <Pill className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No drugs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-gray-500 bg-white/[0.02]">
                  <th className="px-5 py-3 font-medium">Drug Name</th>
                  <th className="px-5 py-3 font-medium">Batch</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Expiry</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((product) => {
                  const status = getExpiryStatus(product.expiryDate);
                  return (
                    <tr 
                      key={product.id} 
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <Pill className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="font-medium text-white">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{product.batchNumber || '—'}</td>
                      <td className="px-5 py-3 text-gray-400">{formatCurrency(product.price)}</td>
                      <td className="px-5 py-3 text-white">{product.stock}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{product.expiryDate || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`badge ${status.class} text-xs`}>{status.text}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pharmacy;