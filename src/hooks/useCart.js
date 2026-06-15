import { useState, useCallback } from 'react';
import { calculateTotal } from '../utils/calculateTotal';

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [discount, setDiscount] = useState(0);

  const addToCart = useCallback((product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setDiscount(0);
  }, []);

  const applyDiscount = useCallback((percentage) => {
    setDiscount(percentage);
  }, []);

  const { subtotal, total } = calculateTotal(cartItems, discount);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    discount,
    applyDiscount,
    subtotal,
    total,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
  };
};