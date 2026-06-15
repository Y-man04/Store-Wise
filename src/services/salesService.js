import { sales } from '../data/sales';
import { products } from '../data/products';

let salesHistory = [...sales];

export const getSalesHistory = () => salesHistory;

export const addSale = (sale) => {
  salesHistory.unshift(sale);
  return sale;
};

export const updateStock = (cartItems) => {
  cartItems.forEach((cartItem) => {
    const product = products.find((p) => p.id === cartItem.id);
    if (product) {
      product.stock = Math.max(0, product.stock - cartItem.quantity);
    }
  });
};