import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import ProductModal from '../components/ProductModal';
import CategoryModal from '../components/CategoryModal';
import { getStoredProducts, saveStoredProducts } from '../utils/productStorage';

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [productList, setProductList] = useState(getStoredProducts);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const syncProducts = () => setProductList(getStoredProducts());
    syncProducts();
    window.addEventListener('products-updated', syncProducts);
    return () => window.removeEventListener('products-updated', syncProducts);
  }, []);

  const groups = useMemo(() => {
    const map = {};
    productList.forEach((p) => {
      const key = p.groupName || p.category || 'Other';
      if (!map[key]) {
        map[key] = { groupName: key, items: [], totalStock: 0 };
      }
      map[key].items.push(p);
      map[key].totalStock += Number(p.stock || 0);
    });
    return Object.values(map).sort((a, b) => a.groupName.localeCompare(b.groupName));
  }, [productList]);

  const filteredGroups = groups.filter((g) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const groupMatch = g.groupName.toLowerCase().includes(query);
    const itemMatch = g.items.some((p) => p.name.toLowerCase().includes(query));
    return groupMatch || itemMatch;
  });

  const getStockStatus = (totalStock) => {
    if (totalStock <= 5) return { label: 'Critical', class: 'badge-red' };
    if (totalStock <= 15) return { label: 'Low', class: 'badge-orange' };
    return { label: 'Good', class: 'badge-green' };
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (productData) => {
    let nextList;
    if (editingProduct) {
      nextList = productList.map((product) =>
        product.id === editingProduct.id ? { ...product, ...productData, id: editingProduct.id } : product
      );
    } else {
      nextList = [
        {
          ...productData,
          groupName: productData.name,
          id: `product-${Date.now()}`,
          barcode: productData.barcode || `barcode-${Date.now()}`,
          stock: Number(productData.stock || 0),
        },
        ...productList,
      ];
    }
    setProductList(nextList);
    saveStoredProducts(nextList);
  };

  const handleGroupChange = (updatedGroupProducts, groupName) => {
    const others = productList.filter((p) => (p.groupName || p.category) !== groupName);
    const next = [...updatedGroupProducts, ...others];
    setProductList(next);
    saveStoredProducts(next);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{groups.length} product types • {productList.length} total items</p>
        </div>
        <button onClick={openAddProduct} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      {filteredGroups.length === 0 ? (
        <div className="p-8 text-center">
          <Package className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredGroups.map((group) => {
            const status = getStockStatus(group.totalStock);
            return (
              <div
                key={group.groupName}
                onClick={() => setSelectedGroup(group.groupName)}
                className="rounded-xl border border-white/10 bg-[#12121a] p-4 cursor-pointer hover:border-white/20 hover:shadow-lg hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-start justify-between">
                  <div className="h-11 w-11 rounded-lg bg-purple-600/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className={`badge ${status.class} text-xs`}>{status.label}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-white leading-snug">{group.groupName}</h3>
                <p className="text-xs text-gray-500 mt-1">{group.items.length} variant{group.items.length !== 1 ? 's' : ''}</p>
                <p className="text-sm font-medium text-gray-300 mt-2">{group.totalStock} in stock</p>
              </div>
            );
          })}
        </div>
      )}

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
      />

      <CategoryModal
        isOpen={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        category={selectedGroup}
        products={productList.filter((p) => (p.groupName || p.category) === selectedGroup)}
        onChange={(updated) => handleGroupChange(updated, selectedGroup)}
      />
    </div>
  );
};

export default Products;