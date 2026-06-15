import { products } from '../data/products';
import { formatCurrency } from '../utils/formatCurrency';
import { AlertTriangle, Calendar, Pill } from 'lucide-react';

const Pharmacy = () => {
  const pharmacyItems = products.filter((p) => p.category === 'Pharmacy');

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { text: 'N/A', color: 'bg-gray-100 text-gray-600' };
    const daysUntil = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return { text: 'Expired', color: 'bg-red-100 text-red-700' };
    if (daysUntil <= 30) return { text: `${daysUntil} days left`, color: 'bg-red-100 text-red-700' };
    if (daysUntil <= 90) return { text: `${daysUntil} days left`, color: 'bg-yellow-100 text-yellow-700' };
    return { text: `${daysUntil} days left`, color: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy</h1>
        <p className="text-sm text-gray-500">Drug inventory and expiry tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Pill className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-purple-800">Total Drugs</h3>
          </div>
          <p className="text-3xl font-bold text-purple-700">{pharmacyItems.length}</p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-800">Expired/Critical</h3>
          </div>
          <p className="text-3xl font-bold text-red-700">
            {pharmacyItems.filter((p) => {
              if (!p.expiryDate) return false;
              const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
              return days <= 30;
            }).length}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-yellow-600" />
            <h3 className="font-bold text-yellow-800">Expiring Soon</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-700">
            {pharmacyItems.filter((p) => {
              if (!p.expiryDate) return false;
              const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
              return days > 30 && days <= 90;
            }).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Drug Inventory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
                <th className="px-5 py-3 font-medium">Drug Name</th>
                <th className="px-5 py-3 font-medium">Batch Number</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Expiry Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {pharmacyItems.map((product) => {
                const status = getExpiryStatus(product.expiryDate);
                return (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="px-5 py-3 text-xs text-gray-500 font-mono">{product.batchNumber || '-'}</td>
                    <td className="px-5 py-3 text-gray-600">{formatCurrency(product.price)}</td>
                    <td className="px-5 py-3 text-gray-600">{product.stock}</td>
                    <td className="px-5 py-3 text-gray-600">{product.expiryDate || '-'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pharmacy;