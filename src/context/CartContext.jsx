import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { calculateTotal } from '../utils/calculateTotal';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('storewise_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    localStorage.setItem('storewise_cart', JSON.stringify(cartItems));
  }, [cartItems]);

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
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setDiscount(0);
  }, []);

  const applyDiscount = useCallback((percentage) => {
    setDiscount(percentage);
  }, []);

  const { subtotal, discount: discountAmount, total } = calculateTotal(cartItems, discount);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    discount,
    applyDiscount,
    subtotal,
    discountAmount,
    total,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};