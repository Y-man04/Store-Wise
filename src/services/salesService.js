import { sales } from '../data/sales';

const STORAGE_KEY = 'storewise_sales';

// Load from localStorage or fallback to default sales
const loadSales = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [...sales];
};

let salesHistory = loadSales();

export const getSalesHistory = () => salesHistory;

export const addSale = (sale) => {
  salesHistory.unshift(sale);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(salesHistory));
  return sale;
};

export const updateStock = (cartItems) => {
  // This modifies the products array in memory - for now that's fine
  // In a real app this would also persist to localStorage
  cartItems.forEach((cartItem) => {
    const product = products.find((p) => p.id === cartItem.id);
    if (product) {
      product.stock = Math.max(0, product.stock - cartItem.quantity);
    }
  });
};