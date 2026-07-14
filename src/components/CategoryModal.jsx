import { useEffect, useState } from 'react';
import { X, Plus, Trash2, Pencil } from 'lucide-react';
import { saveStoredProducts } from '../utils/productStorage';
import { formatCurrency } from '../utils/formatCurrency';
import ProductModal from './ProductModal';

const CategoryModal = ({ isOpen, onClose, category, products = [], onChange }) => {
  const [localProducts, setLocalProducts] = useState([]);
  const [editingVariant, setEditingVariant] = useState(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  useEffect(() => {
    setLocalProducts(products || []);
  }, [products, isOpen]);

  if (!isOpen) return null;

  const commit = (next) => {
    setLocalProducts(next);
    saveStoredProducts(next);
    onChange && onChange(next);
  };

  const updateVariantStock = (id, delta) => {
    const next = localProducts.map((p) =>
      p.id === id ? { ...p, stock: Math.max(0, Number(p.stock || 0) + Number(delta)) } : p
    );
    commit(next);
  };

  const deleteVariant = (id) => {
    if (!window.confirm('Delete this product variant?')) return;
    commit(localProducts.filter((p) => p.id !== id));
  };

  const openAddVariant = () => {
    setEditingVariant(null);
    setIsVariantModalOpen(true);
  };

  const openEditVariant = (variant) => {
    setEditingVariant(variant);
    setIsVariantModalOpen(true);
  };

  const handleSaveVariant = (data) => {
    let next;
    if (editingVariant) {
      next = localProducts.map((p) =>
        p.id === editingVariant.id ? { ...p, ...data, id: editingVariant.id, groupName: category } : p
      );
    } else {
      next = [
        {
          ...data,
          id: `product-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          groupName: category,
          barcode: data.barcode || `barcode-${Date.now()}`,
          stock: Number(data.stock || 0),
        },
        ...localProducts,
      ];
    }
    commit(next);
  };

  const totalStock = localProducts.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  const lockedCategory = localProducts[0]?.category || 'Groceries';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111118] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">{category}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {localProducts.length} variant{localProducts.length !== 1 ? 's' : ''} • {totalStock} total in stock
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {localProducts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No variants yet. Add one below.</p>
          ) : (
            localProducts.map((variant) => (
              <div key={variant.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-[#0e0e14] p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{variant.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(variant.price)} {variant.batchNumber && `• Batch ${variant.batchNumber}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => updateVariantStock(variant.id, -1)} className="btn btn-secondary py-1 px-2 text-xs">-1</button>
                  <span className="text-sm text-gray-300 w-10 text-center">{variant.stock}</span>
                  <button onClick={() => updateVariantStock(variant.id, 1)} className="btn btn-secondary py-1 px-2 text-xs">+1</button>
                  <button onClick={() => openEditVariant(variant)} className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteVariant(variant.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          <button onClick={openAddVariant} className="btn btn-primary w-full flex items-center justify-center gap-2 mt-2">
            <Plus className="w-4 h-4" />
            Add Variant to {category}
          </button>
        </div>
      </div>

      <ProductModal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        onSave={handleSaveVariant}
        product={editingVariant}
        lockedCategory={lockedCategory}
      />
    </div>
  );
};

export default CategoryModal;