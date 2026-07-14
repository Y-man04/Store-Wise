import { isServiceType } from '../data/serviceTypes';
import { products as defaultProducts } from '../data/products';

const PRODUCT_STORAGE_KEY = 'storewise_products';

export const STORE_TYPE_CATEGORIES = {
  supermarket: ['Beverages', 'Groceries', 'Snacks', 'Dairy', 'Household', 'Personal Care'],
  pharmacy: ['Pharmacy', 'Personal Care'],
  retail: ['Beverages', 'Groceries', 'Snacks', 'Dairy', 'Household', 'Personal Care'],
  restaurant: ['Beverages', 'Groceries', 'Dairy', 'Food'],
};

const getBusinessType = () => {
  try {
    const business = JSON.parse(localStorage.getItem('storewise_business') || '{}');
    return (business.type || 'supermarket').toLowerCase();
  } catch {
    return 'supermarket';
  }
};

const seedProductsForStore = () => {
  const storeType = getBusinessType();

  if (isServiceType(storeType)) {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  const matching = defaultProducts.filter(
    (p) => Array.isArray(p.storeTypes) && p.storeTypes.includes(storeType)
  );
  const seeded = matching.length > 0 ? matching : defaultProducts;
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
};

export const getStoredProducts = () => {
  if (typeof window === 'undefined') return defaultProducts;

  try {
    const stored = localStorage.getItem(PRODUCT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load stored products:', error);
  }

  return seedProductsForStore();
};

export const saveStoredProducts = (productList) => {
  if (typeof window === 'undefined') return productList;

  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(productList));
  window.dispatchEvent(new Event('products-updated'));
  return productList;
};

export const reduceProductsStock = (productList, soldItems) => {
  const nextList = productList.map((product) => {
    const soldItem = soldItems.find((item) => item.id === product.id);
    if (!soldItem) return product;

    const quantitySold = Number(soldItem.quantity || 0);
    return {
      ...product,
      stock: Math.max(0, Number(product.stock || 0) - quantitySold),
    };
  });

  return saveStoredProducts(nextList);
};

export const getCategoriesForStoreType = (type) => {
  const key = (type || 'supermarket').toLowerCase();
  return STORE_TYPE_CATEGORIES[key] || STORE_TYPE_CATEGORIES.supermarket;
};