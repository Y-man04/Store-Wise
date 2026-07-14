const ORDER_STORAGE_KEY = 'storewise_orders';

export const ORDER_STATUSES = ['Pending', 'In Progress', 'Ready', 'Delivered'];

export const getStoredOrders = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(ORDER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load stored orders:', error);
    return [];
  }
};

export const saveStoredOrders = (orders) => {
  if (typeof window === 'undefined') return orders;
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event('orders-updated'));
  return orders;
};

export const addOrder = (orderData) => {
  const orders = getStoredOrders();
  const newOrder = {
    id: `order-${Date.now()}`,
    status: 'Pending',
    amountPaid: 0,
    createdAt: new Date().toISOString(),
    ...orderData,
  };
  saveStoredOrders([newOrder, ...orders]);
  return newOrder;
};

export const updateOrder = (id, updates) => {
  const orders = getStoredOrders();
  const next = orders.map((o) => (o.id === id ? { ...o, ...updates } : o));
  saveStoredOrders(next);
  return next;
};

export const deleteOrder = (id) => {
  const orders = getStoredOrders();
  const next = orders.filter((o) => o.id !== id);
  saveStoredOrders(next);
  return next;
};