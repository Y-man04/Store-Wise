import { useState, useRef, useEffect } from 'react';
import { useCartContext } from '../context/CartContext';
import { useAuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { addSale } from '../services/salesService';
import { getStoredProducts, reduceProductsStock } from '../utils/productStorage';
import ServicePOS from './ServicePOS';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Receipt,
  Barcode,
  Search,
  X,
  Printer,
  RotateCcw,
  ChevronRight,
  Banknote,
  Smartphone,
  Keyboard
} from 'lucide-react';

const getBusiness = () => {
  try {
    return JSON.parse(localStorage.getItem('storewise_business') || '{}');
  } catch {
    return {};
  }
};

// Category colors for product initials
const categoryColors = {
  Beverages: 'bg-blue-500/20 text-blue-400',
  Groceries: 'bg-green-500/20 text-green-400',
  Snacks: 'bg-orange-500/20 text-orange-400',
  Dairy: 'bg-yellow-500/20 text-yellow-400',
  Household: 'bg-cyan-500/20 text-cyan-400',
  'Personal Care': 'bg-pink-500/20 text-pink-400',
  Pharmacy: 'bg-red-500/20 text-red-400',
};

const getInitials = (name) => {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
};

const ProductPOS = () => {
  const { user } = useAuthContext();
  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    total,
    itemCount,
  } = useCartContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [lastSale, setLastSale] = useState(null);
  const [inventoryProducts, setInventoryProducts] = useState(getStoredProducts);
  const barcodeRef = useRef(null);

  const categories = ['All', 'Beverages', 'Groceries', 'Snacks', 'Dairy', 'Household', 'Personal Care', 'Pharmacy'];

  useEffect(() => {
    const syncProducts = () => setInventoryProducts(getStoredProducts());
    syncProducts();
    window.addEventListener('products-updated', syncProducts);
    return () => window.removeEventListener('products-updated', syncProducts);
  }, []);

  const filteredProducts = inventoryProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Auto-focus barcode input
  useEffect(() => {
    if (barcodeRef.current && !showCheckout && !receipt) {
      barcodeRef.current.focus();
    }
  }, [showCheckout, receipt]);

  // Handle barcode scan
  const handleBarcode = (e) => {
    if (e.key === 'Enter') {
      const product = inventoryProducts.find(p => p.barcode === barcodeInput.trim());
      if (product) {
        addToCart(product);
        setBarcodeInput('');
      } else {
        setBarcodeInput('');
      }
    }
  };

  // Load last sale
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('storewise_sales') || '[]');
    if (history.length > 0) setLastSale(history[0]);
  }, []);

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
      items: cartItems.map(item => ({ ...item })),
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod,
      amountTendered: tendered,
      change: change > 0 ? change : 0,
      cashier: user?.name || 'Cashier',
      date: new Date().toISOString(),
    };

    reduceProductsStock(inventoryProducts, cartItems);
    setInventoryProducts(getStoredProducts());
    addSale(sale);
    setReceipt(sale);
    setLastSale(sale);
    setShowCheckout(false);
    clearCart();
  };

  const handleReprint = () => {
    if (lastSale) window.print();
  };

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showCheckout || receipt) return;
      if (e.target.tagName === 'INPUT') {
        if (e.key === 'Escape') {
          e.target.blur();
          if (barcodeRef.current) barcodeRef.current.focus();
        }
        return;
      }

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          clearCart();
          if (barcodeRef.current) barcodeRef.current.focus();
          break;
        case 'F2':
          e.preventDefault();
          handleCheckout();
          break;
        case 'F3':
          e.preventDefault();
          handleReprint();
          break;
        case 'F4':
          e.preventDefault();
          setShowShortcuts(true);
          break;
        case 'Escape':
          e.preventDefault();
          clearCart();
          break;
        case 'c':
        case 'C':
          if (e.ctrlKey) {
            e.preventDefault();
            handleCheckout();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCheckout, receipt, cartItems, total, lastSale]);

  const change = (parseFloat(amountTendered) || 0) - total;

  // Receipt view
  if (receipt) {
    return (
      <div className="h-full flex items-start justify-center pt-8 pb-8 px-4">
        <div className="card p-8 max-w-sm w-full text-center overflow-auto max-h-[calc(100vh-4rem)]">
          <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Sale Complete</h2>
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
              {receipt.discount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="text-green-400">-{formatCurrency(receipt.discount)}</span></div>}
              <div className="flex justify-between text-lg font-bold"><span className="text-white">Total</span><span className="text-white">{formatCurrency(receipt.total)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Paid ({receipt.paymentMethod})</span><span className="text-white">{formatCurrency(receipt.amountTendered)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Change</span><span className="text-green-400 font-bold">{formatCurrency(receipt.change)}</span></div>
            </div>
          </div>

          <div className="flex gap-3 no-print">
            <button onClick={() => setReceipt(null)} className="btn btn-primary flex-1">New Sale</button>
            <button onClick={handleReprint} className="btn btn-secondary flex items-center justify-center gap-2"><Printer className="w-4 h-4" />Print</button>
          </div>
        </div>

        <div className="print-only fixed top-0 left-0 w-full bg-white text-black p-8">
          <div className="max-w-xs mx-auto">
            <h2 className="text-center text-xl font-bold mb-1">{user?.businessName || 'STORE-WISE'}</h2>
            <p className="text-center text-xs text-gray-500 mb-1">{user?.location || 'Lagos, Nigeria'}</p>
            <p className="text-center text-xs text-gray-500 mb-4">Tel: {user?.phone || '0800-000-0000'}</p>
            <div className="border-t border-b border-black py-2 mb-4">
              <div className="flex justify-between text-xs"><span>Receipt: {receipt.id}</span><span>{new Date(receipt.date).toLocaleString('en-NG')}</span></div>
              <div className="text-xs mt-1">Cashier: {receipt.cashier}</div>
            </div>
            <div className="space-y-1 mb-4">
              {receipt.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm"><span>{item.name} x{item.quantity}</span><span className="font-mono">{formatCurrency(item.price * item.quantity)}</span></div>
              ))}
            </div>
            <div className="border-t border-black pt-2 space-y-1">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-mono">{formatCurrency(receipt.subtotal)}</span></div>
              {receipt.discount > 0 && <div className="flex justify-between text-sm"><span>Discount</span><span className="font-mono">-{formatCurrency(receipt.discount)}</span></div>}
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
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Items</span><span className="text-white">{itemCount}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="text-white">{formatCurrency(subtotal)}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="text-green-400">-{formatCurrency(discountAmount)}</span></div>}
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
            <button onClick={handlePayment} disabled={paymentMethod === 'Cash' && change < 0} className="btn btn-primary w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed">Complete Sale — {formatCurrency(total)}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden relative">
      {/* LEFT: Products */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 space-y-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input ref={barcodeRef} type="text" placeholder="Scan barcode or type and press Enter..." value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} onKeyDown={handleBarcode} className="input pl-10 w-full" />
            </div>
            <button onClick={handleReprint} disabled={!lastSale} className="btn btn-secondary flex items-center gap-2 disabled:opacity-30 shrink-0" title="Reprint last receipt (F3)"><RotateCcw className="w-4 h-4" /><span className="hidden sm:inline">Reprint</span></button>
            <button onClick={() => setShowShortcuts(true)} className="btn btn-secondary flex items-center gap-2 shrink-0" title="Keyboard shortcuts (F4)"><Keyboard className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{cat}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500"><Search className="w-10 h-10 mb-3 opacity-30" /><p className="text-sm">No products found</p></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => {
                const cartItem = cartItems.find((item) => item.id === product.id);
                const quantity = cartItem?.quantity || 0;
                const isLow = product.stock <= (product.reorderLevel || 10);
                const colorClass = categoryColors[product.category] || 'bg-gray-500/20 text-gray-400';

                return (
                  <button key={product.id} onClick={() => addToCart(product)} className={`card p-3 text-left relative transition-colors hover:border-white/20 ${quantity > 0 ? 'border-purple-500/40 bg-purple-500/5' : ''}`}>
                    {quantity > 0 && <div className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">{quantity}</div>}
                    {isLow && quantity === 0 && <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full" />}

                    {/* Product Image / Initials */}
                    <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center mb-2 text-xs font-bold`}>
                      {getInitials(product.name)}
                    </div>

                    <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                    <p className="text-sm font-medium text-white leading-snug mb-2 line-clamp-2 min-h-[2.5rem]">{product.name}</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(product.price)}</p>
                    <p className={`text-xs mt-1 ${isLow ? 'text-orange-400' : 'text-gray-600'}`}>{product.stock} in stock</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="w-80 lg:w-96 border-l border-white/5 flex flex-col bg-[#0d0d14] shrink-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-bold text-white">Current Sale</h2>
            {itemCount > 0 && <span className="badge badge-purple text-xs">{itemCount}</span>}
          </div>
          {cartItems.length > 0 && <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-300">Clear (Esc)</button>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-12"><ShoppingCart className="w-10 h-10 text-gray-700 mx-auto mb-3" /><p className="text-sm text-gray-500">Cart is empty</p><p className="text-xs text-gray-600 mt-1">Click a product or scan barcode</p></div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center rounded bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"><Minus className="w-3 h-3" /></button>
                  <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"><Plus className="w-3 h-3" /></button>
                </div>
                <div className="text-right min-w-[4rem]"><p className="text-sm font-bold text-white">{formatCurrency(item.price * item.quantity)}</p></div>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/5 space-y-3 shrink-0">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="text-white">{formatCurrency(subtotal)}</span></div>
            {discountAmount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-green-400">-{formatCurrency(discountAmount)}</span></div>}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10"><span className="text-white">Total</span><span className="text-white">{formatCurrency(total)}</span></div>
          </div>
          <button onClick={handleCheckout} disabled={cartItems.length === 0} className="btn btn-primary w-full py-3 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">Checkout (F2)<ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {showShortcuts && (
        <div className="absolute top-4 right-4 z-50 w-full max-w-sm rounded-3xl border border-white/10 bg-[#111118] p-5 shadow-2xl shadow-black/60 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Keyboard Shortcuts</h3>
              <p className="text-xs text-gray-500">Helpful shortcuts while you keep the POS visible.</p>
            </div>
            <button onClick={() => setShowShortcuts(false)} className="p-2 text-gray-400 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">F1</span><span className="text-white">New Sale (clear cart)</span></div>
            <div className="flex justify-between"><span className="text-gray-400">F2</span><span className="text-white">Checkout</span></div>
            <div className="flex justify-between"><span className="text-gray-400">F3</span><span className="text-white">Reprint Last Receipt</span></div>
            <div className="flex justify-between"><span className="text-gray-400">F4</span><span className="text-white">Show Shortcuts</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Esc</span><span className="text-white">Clear Cart</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Ctrl + C</span><span className="text-white">Checkout</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Enter</span><span className="text-white">Scan Barcode</span></div>
          </div>
          <button onClick={() => setShowShortcuts(false)} className="btn btn-primary w-full mt-4">Got it</button>
        </div>
      )}
    </div>
  );
};

// Main POS component — routes to ProductPOS or ServicePOS based on business type
const POS = () => {
  const business = getBusiness();
  const isServiceBusiness = ['tailoring', 'salon', 'laundry', 'other_service'].includes(business.type);

  if (isServiceBusiness) {
    return <ServicePOS />;
  }

  return <ProductPOS />;
};

export default POS;