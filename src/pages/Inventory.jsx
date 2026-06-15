import { products } from '../data/products';
import { formatCurrency } from '../utils/formatCurrency';
import { AlertTriangle, Package, Calendar } from 'lucide-react';

const Inventory = () => {
  const lowStock = products.filter((p) => p.stock <= 20);
  const expiredItems = products.filter((p) => {
    if (!p.expiryDate) return false;
    return new Date(p.expiryDate) < new Date();
  });
  const expiringSoon = products.filter((p) => {
    if (!p.expiryDate) return false;
    const daysUntilExpiry = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 90;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="text-sm text-gray-500">Stock levels and alerts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-orange-800">Low Stock</h3>
          </div>
          <p className="text-3xl font-bold text-orange-700">{lowStock.length}</p>
          <p className="text-sm text-orange-600 mt-1">Items need restocking</p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-800">Expired</h3>
          </div>
          <p className="text-3xl font-bold text-red-700">{expiredItems.length}</p>
          <p className="text-sm text-red-600 mt-1">Items past expiry date</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-yellow-600" />
            <h3 className="font-bold text-yellow-800">Expiring Soon</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-700">{expiringSoon.length}</p>
          <p className="text-sm text-yellow-600 mt-1">Within 90 days</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Low Stock Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Current Stock</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((product) => (
                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{product.name}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">{product.category}</span>
                  </td>
                  <td className="px-5 py-3 font-bold text-red-600">{product.stock}</td>
                  <td className="px-5 py-3 text-gray-600">{formatCurrency(product.price)}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Restock Needed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {expiredItems.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Expired Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Batch</th>
                  <th className="px-5 py-3 font-medium">Expiry Date</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {expiredItems.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-red-700">{product.name}</td>
                    <td className="px-5 py-3 text-xs text-gray-500 font-mono">{product.batchNumber}</td>
                    <td className="px-5 py-3 text-red-600 font-medium">{product.expiryDate}</td>
                    <td className="px-5 py-3 text-gray-600">{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;