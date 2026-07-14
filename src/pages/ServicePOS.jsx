import { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { addSale } from '../services/salesService';
import { addOrder } from '../utils/orderStorage';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Search,
  X,
  Phone,
  User,
  ChevronRight,
  Banknote,
  Smartphone,
  Calendar,
  Tag,
  ClipboardList
} from 'lucide-react';

// Default service items by business type
const DEFAULT_SERVICE_ITEMS = {
  laundry: [
    { type: 'Shirt', services: { 'Wash & Iron': 300, 'Dry Clean': 500, 'Iron Only': 150 } },
    { type: 'Trouser', services: { 'Wash & Iron': 350, 'Dry Clean': 600, 'Iron Only': 150 } },
    { type: 'Suit (2pc)', services: { 'Dry Clean': 1500, 'Press Only': 500 } },
    { type: 'Gown/Dress', services: { 'Wash & Iron': 500, 'Dry Clean': 1000 } },
    { type: 'Bedsheet', services: { 'Wash & Iron': 400, 'Dry Clean': 700 } },
    { type: 'Towel', services: { 'Wash & Iron': 200, 'Dry Clean': 400 } },
    { type: 'Native Wear', services: { 'Wash & Iron': 400, 'Dry Clean': 800 } },
    { type: 'Jacket/Blazer', services: { 'Dry Clean': 800, 'Press Only': 300 } },
  ],
  tailoring: [
    { type: 'Shirt', services: { 'Sew New': 2500, 'Alter': 800, 'Repair': 500 } },
    { type: 'Trouser', services: { 'Sew New': 3000, 'Alter': 1000, 'Repair': 600 } },
    { type: 'Agbada (3pc)', services: { 'Sew New': 15000, 'Alter': 2000 } },
    { type: 'Native Wear', services: { 'Sew New': 8000, 'Alter': 1500 } },
    { type: 'Suit (2pc)', services: { 'Sew New': 25000, 'Alter': 3000 } },
    { type: 'Gown/Dress', services: { 'Sew New': 8000, 'Alter': 1500 } },
    { type: 'Skirt', services: { 'Sew New': 4000, 'Alter': 1000 } },
    { type: 'Jacket/Blazer', services: { 'Sew New': 12000, 'Alter': 2000 } },
  ],
  other_service: [
    { type: 'Service Item', services: { 'Standard': 1000, 'Premium': 2000, 'Express': 3000 } },
  ],
};

const getBusiness = () => {
  try {
    return JSON.parse(localStorage.getItem('storewise_business') || '{}');
  } catch {
    return {};
  }
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const ServicePOS = () => {
  const { user } = useAuthContext();
  const business = getBusiness();
  const businessType = business.type || 'laundry';
  const serviceItems = DEFAULT_SERVICE_ITEMS[businessType] || DEFAULT_SERVICE_ITEMS.other_service;

  // Cart holds service line items
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Checkout state
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [lastSale, setLastSale] = useState(null);

  // Load last sale
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('storewise_sales') || '[]');
    if (history.length > 0) setLastSale(history[0]);
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const filteredItems = serviceItems.filter((item) =>
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (itemType, serviceName, price) => {
    const existing = cartItems.find(
      (item) => item.itemType === itemType && item.serviceName === serviceName
    );
    if (existing) {
      setCartItems(cartItems.map((item) =>
        item.id === existing.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: `${itemType}-${serviceName}-${Date.now()}`,
        itemType,
        serviceName,
        price,
        quantity: 1,
      }]);
    }
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      setCartItems(cartItems.filter((item) => item.id !== id));
    } else {
      setCartItems(cartItems.map((item) =>
        item.id === id ? { ...item, quantity: qty } : item
      ));
    }
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setDueDate('');
    setNotes('');
    setAmountTendered('');
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setShowCheckout(true);
    setAmountTendered(total.toString());
  };

  const handlePayment = () => {
    const tendered = parseFloat(amountTendered) || 0;
    const change = tendered - total;

    const sale = {
      id: `RCP-${Date.now().toString().slice(-6)}`,
      items: cartItems.map(item => ({
        id: item.id,
        name: `${item.itemType} — ${item.serviceName}`,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal,
      discount: 0,
      total,
      paymentMethod,
      amountTendered: tendered,
      change: change > 0 ? change : 0,
      cashier: user?.name || 'Staff',
      date: new Date().toISOString(),
      customerName: customerName.trim() || 'Walk-in',
      customerPhone: customerPhone.trim(),
    };

    // Create the order too
    const orderDesc = cartItems.map(i => `${i.quantity}x ${i.itemType} (${i.serviceName})`).join(', ');
    addOrder({
      customerName: customerName.trim() || 'Walk-in',
      customerPhone: customerPhone.trim(),
      description: orderDesc,
      price: total,
      dueDate: dueDate || todayISO(),
      details: [
        { label: 'Notes', value: notes },
        ...cartItems.map(i => ({ label: i.itemType, value: `${i.quantity}x ${i.serviceName} @ ${formatCurrency(i.price)}` })),
      ],
      assignedTo: user?.name || 'Staff',
      amountPaid: tendered,
    });

    addSale(sale);
    setReceipt(sale);
    setLastSale(sale);
    setShowCheckout(false);
    clearCart();
  };

  const handleReprint = () => {
    if (lastSale) window.print();
  };

  const change = (parseFloat(amountTendered) || 0) - total;

  // Receipt view
  if (receipt) {
    return (
      <div className="h-full flex items-start justify-center pt-8 pb-8 px-4">
        <div className="card p-8 max-w-sm w-full text-center overflow-auto max-h-[calc(100vh-4rem)]">
          <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Order Created</h2>
          <p className="text-sm text-gray-500 mb-6">{receipt.id}</p>

          <div className="text-left space-y-2 mb-6">
            {receipt.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.name} x{item.quantity}</span>
                <span className="text-white font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="text-white">{formatCurrency(receipt.subtotal)}</span></div>
              <div className="flex justify-between text-lg font-bold"><span className="text-white">Total</span><span className="text-white">{formatCurrency(receipt.total)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Paid ({receipt.paymentMethod})</span><span className="text-white">{formatCurrency(receipt.amountTendered)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Change</span><span className="text-green-400 font-bold">{formatCurrency(receipt.change)}</span></div>
            </div>
          </div>

          <div className="flex gap-3 no-print">
            <button onClick={() => setReceipt(null)} className="btn btn-primary flex-1">New Order</button>
            <button onClick={handleReprint} className="btn btn-secondary flex items-center justify-center gap-2"><Receipt className="w-4 h-4" />Print</button>
          </div>
        </div>

        <div className="print-only fixed top-0 left-0 w-full bg-white text-black p-8">
          <div className="max-w-xs mx-auto">
            <h2 className="text-center text-xl font-bold mb-1">{user?.businessName || 'STORE-WISE'}</h2>
            <p className="text-center text-xs text-gray-500 mb-1">{business?.name || 'Service Business'}</p>
            <p className="text-center text-xs text-gray-500 mb-4">Tel: {business?.phone || '0800-000-0000'}</p>
            <div className="border-t border-b border-black py-2 mb-4">
              <div className="flex justify-between text-xs"><span>Receipt: {receipt.id}</span><span>{new Date(receipt.date).toLocaleString('en-NG')}</span></div>
              <div className="text-xs mt-1">Cashier: {receipt.cashier}</div>
              {receipt.customerName && <div className="text-xs mt-1">Customer: {receipt.customerName}</div>}
            </div>
            <div className="space-y-1 mb-4">
              {receipt.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm"><span>{item.name} x{item.quantity}</span><span className="font-mono">{formatCurrency(item.price * item.quantity)}</span></div>
              ))}
            </div>
            <div className="border-t border-black pt-2 space-y-1">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-mono">{formatCurrency(receipt.subtotal)}</span></div>
              <div className="flex justify-between text-lg font-bold"><span>TOTAL</span><span className="font-mono">{formatCurrency(receipt.total)}</span></div>
              <div className="flex justify-between text-sm"><span>Paid ({receipt.paymentMethod})</span><span className="font-mono">{formatCurrency(receipt.amountTendered)}</span></div>
              <div className="flex justify-between text-sm"><span>Change</span><span className="font-mono">{formatCurrency(receipt.change)}</span></div>
            </div>
            <div className="text-center mt-6 pt-4 border-t border-black">
              <p className="text-xs text-gray-500">Thank you for your patronage!</p>
              <p className="text-xs text-gray-500 mt-1">Goods sold in good condition are not returnable</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checkout modal
  if (showCheckout) {
    return (
      <div className="h-full flex items-center justify-center overflow-hidden">
        <div className="card p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Checkout</h2>
            <button onClick={() => setShowCheckout(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="mb-4 p-3 rounded-lg bg-white/5">
            <p className="text-xs text-gray-500 mb-1">Customer</p>
            <p className="text-sm font-medium text-white">{customerName || 'Walk-in'}</p>
            {customerPhone && <p className="text-xs text-gray-500">{customerPhone}</p>}
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Items</span><span className="text-white">{itemCount}</span></div>
            <div className="flex justify-between text-xl font-bold border-t border-white/10 pt-3"><span className="text-white">Total</span><span className="text-white">{formatCurrency(total)}</span></div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Payment Method</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPaymentMethod('Cash')} className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${paymentMethod === 'Cash' ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}><Banknote className="w-4 h-4" />Cash</button>
                <button onClick={() => setPaymentMethod('Transfer')} className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${paymentMethod === 'Transfer' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}><Smartphone className="w-4 h-4" />Transfer</button>
              </div>
            </div>
            {paymentMethod === 'Cash' && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Amount Tendered</p>
                <input type="number" value={amountTendered} onChange={(e) => setAmountTendered(e.target.value)} className="input text-lg font-bold text-center" placeholder="0" autoFocus />
                {change >= 0 && <p className="text-center text-sm mt-2"><span className="text-gray-500">Change: </span><span className="text-green-400 font-bold text-lg">{formatCurrency(change)}</span></p>}
                {change < 0 && <p className="text-center text-sm mt-2 text-red-400">Insufficient amount</p>}
              </div>
            )}
            <button onClick={handlePayment} disabled={paymentMethod === 'Cash' && change < 0} className="btn btn-primary w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed">Complete Order — {formatCurrency(total)}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden relative">
      {/* LEFT: Service Item Builder */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Customer Header */}
        <div className="p-4 border-b border-white/5 space-y-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                placeholder="Due date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search item types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {/* Service Items Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map((item) => (
              <div key={item.type} className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">{item.type}</h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(item.services).map(([serviceName, price]) => {
                    const inCart = cartItems.find(
                      (c) => c.itemType === item.type && c.serviceName === serviceName
                    );
                    return (
                      <button
                        key={serviceName}
                        onClick={() => addToCart(item.type, serviceName, price)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors ${
                          inCart
                            ? 'bg-purple-600/20 border border-purple-500/30'
                            : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'
                        }`}
                      >
                        <div>
                          <p className="text-sm text-white">{serviceName}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(price)}</p>
                        </div>
                        {inCart && (
                          <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {inCart.quantity}
                          </span>
                        )}
                        {!inCart && <Plus className="w-4 h-4 text-gray-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Search className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No items found</p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <input
            type="text"
            placeholder="Notes (stains, special instructions, etc.)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input w-full"
          />
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="w-80 lg:w-96 border-l border-white/5 flex flex-col bg-[#0d0d14] shrink-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-bold text-white">Current Order</h2>
            {itemCount > 0 && <span className="badge badge-purple text-xs">{itemCount}</span>}
          </div>
          {cartItems.length > 0 && (
            <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-300">Clear</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Order is empty</p>
              <p className="text-xs text-gray-600 mt-1">Click a service to add items</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.itemType}</p>
                  <p className="text-xs text-gray-500">{item.serviceName} — {formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center rounded bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"><Minus className="w-3 h-3" /></button>
                  <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"><Plus className="w-3 h-3" /></button>
                </div>
                <div className="text-right min-w-[4rem]">
                  <p className="text-sm font-bold text-white">{formatCurrency(item.price * item.quantity)}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/5 space-y-3 shrink-0">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="text-white">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10"><span className="text-white">Total</span><span className="text-white">{formatCurrency(total)}</span></div>
          </div>
          <button onClick={handleCheckout} disabled={cartItems.length === 0} className="btn btn-primary w-full py-3 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
            Checkout <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicePOS;