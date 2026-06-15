import ProductModal from '../components/ProductModal';
import { useState } from 'react';
import { products } from '../data/products';
import { formatCurrency } from '../utils/formatCurrency';
import { Search, Plus, Edit2, Trash2, Package } from 'lucide-react';

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshKey, setRefreshKey] = useState(0);

  const categories = ['All', 'Beverages', 'Groceries', 'Pharmacy'];

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock) => {
    if (stock <= 10) return { text: 'Critical', color: 'bg-red-100 text-red-700' };
    if (stock <= 20) return { text: 'Low', color: 'bg-orange-100 text-orange-700' };
    return { text: 'Good', color: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">Manage your inventory</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div key={refreshKey} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Barcode</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((product) => {
                const status = getStockStatus(product.stock);
                return (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          {product.batchNumber && (
                            <p className="text-xs text-gray-400">Batch: {product.batchNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{formatCurrency(product.price)}</td>
                    <td className="px-5 py-3 text-gray-600">{product.stock}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 font-mono">{product.barcode}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setIsModalOpen(true);
                          }}
                          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
                              const idx = products.findIndex((p) => p.id === product.id);
                              if (idx !== -1) products.splice(idx, 1);
                              setRefreshKey((prev) => prev + 1);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 50 && (
          <div className="px-5 py-3 border-t border-gray-100 text-center text-sm text-gray-500">
            Showing 50 of {filtered.length} products
          </div>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSave={(data) => {
          if (editingProduct) {
            const idx = products.findIndex((p) => p.id === editingProduct.id);
            if (idx !== -1) products[idx] = { ...editingProduct, ...data };
          } else {
            const newId = Math.max(...products.map((p) => p.id), 0) + 1;
            products.push({ id: newId, ...data });
          }
          setRefreshKey((prev) => prev + 1);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default Products;