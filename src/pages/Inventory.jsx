import { useState } from 'react';
import { products } from '../data/products';
import { formatCurrency } from '../utils/formatCurrency';
import { AlertTriangle, Package, Calendar, Search } from 'lucide-react';

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const lowStock = products.filter((p) => p.stock <= (p.reorderLevel || 10));
  const expiredItems = products.filter((p) => {
    if (!p.expiryDate) return false;
    return new Date(p.expiryDate) < new Date();
  });
  const expiringSoon = products.filter((p) => {
    if (!p.expiryDate) return false;
    const daysUntil = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 30;
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'All') return matchesSearch;
    if (filter === 'Low Stock') return matchesSearch && p.stock <= (p.reorderLevel || 10);
    if (filter === 'Expired') return matchesSearch && p.expiryDate && new Date(p.expiryDate) < new Date();
    if (filter === 'Expiring Soon') {
      if (!p.expiryDate) return false;
      const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return matchesSearch && days > 0 && days <= 30;
    }
    return matchesSearch;
  });

  const getStockStatus = (product) => {
    if (product.stock <= 5) return { label: 'Critical', class: 'badge-red' };
    if (product.stock <= (product.reorderLevel || 10)) return { label: 'Low', class: 'badge-orange' };
    return { label: 'Good', class: 'badge-green' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} items tracked</p>
        </div>
      </div>

      {/* Alert Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-l-orange-500 bg-orange-500/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock</p>
              <p className="text-xl font-bold text-white">{lowStock.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-red-500 bg-red-500/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-xl font-bold text-white">{expiredItems.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-yellow-500 bg-yellow-500/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Expiring Soon</p>
              <p className="text-xl font-bold text-white">{expiringSoon.length}</p>
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
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full sm:w-80"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Low Stock', 'Expired', 'Expiring Soon'].map((f) => (
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

      {/* Inventory Table */}
      <div className="card p-0 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-gray-500 bg-white/[0.02]">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <tr 
                      key={product.id} 
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="font-medium text-white">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="badge badge-purple text-xs">{product.category}</span>
                      </td>
                      <td className="px-5 py-3 font-bold text-white">{product.stock}</td>
                      <td className="px-5 py-3 text-gray-400">{formatCurrency(product.price)}</td>
                      <td className="px-5 py-3">
                        <span className={`badge ${status.class} text-xs`}>{status.label}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {product.expiryDate || '—'}
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

export default Inventory;