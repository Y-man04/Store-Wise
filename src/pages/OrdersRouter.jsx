import TailoringOrders from './TailoringOrders';
import LaundryOrders from './LaundryOrders';
import Orders from './Orders';

const getBusiness = () => {
  try {
    return JSON.parse(localStorage.getItem('storewise_business') || '{}');
  } catch {
    return {};
  }
};

const OrdersRouter = () => {
  const business = getBusiness();

  if (business.type === 'tailoring') {
    return <TailoringOrders />;
  }

  if (business.type === 'laundry') {
    return <LaundryOrders />;
  }

  // Other Service still uses the generic Orders page for now
  return <Orders />;
};

export default OrdersRouter;