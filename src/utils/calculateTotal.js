export const calculateTotal = (items, discount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * (discount / 100);
  return {
    subtotal,
    discount: discountAmount,
    total: subtotal - discountAmount,
  };
};