import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, onSave, product = null, lockedCategory = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: lockedCategory || 'Beverages',
    price: '',
    stock: '',
    barcode: '',
    expiryDate: '',
    batchNumber: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || lockedCategory || 'Beverages',
        price: product.price || '',
        stock: product.stock || '',
        barcode: product.barcode || '',
        expiryDate: product.expiryDate || '',
        batchNumber: product.batchNumber || '',
      });
    } else {
      setFormData({
        name: '',
        category: lockedCategory || 'Beverages',
        price: '',
        stock: '',
        barcode: '',
        expiryDate: '',
        batchNumber: '',
      });
    }
  }, [product, isOpen, lockedCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111118] rounded-3xl shadow-2xl shadow-black/60 w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input bg-[#16161f] border-white/10 text-white"
              required
            />
          </div>

          {!lockedCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input bg-[#16161f] border-white/10 text-white"
              >
                <option>Beverages</option>
                <option>Groceries</option>
                <option>Snacks</option>
                <option>Dairy</option>
                <option>Household</option>
                <option>Personal Care</option>
                <option>Pharmacy</option>
                <option>Food</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Price (₦)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input bg-[#16161f] border-white/10 text-white"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="input bg-[#16161f] border-white/10 text-white"
                required
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Barcode</label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="input bg-[#16161f] border-white/10 text-white"
            />
          </div>

          {(lockedCategory === 'Pharmacy' || formData.category === 'Pharmacy') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="input bg-[#16161f] border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="input bg-[#16161f] border-white/10 text-white"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
            >
              {product ? 'Update' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;