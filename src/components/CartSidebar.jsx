import { useState } from 'react';
import { X, Minus, Plus, Trash2, Tag, Percent, Printer, CheckCircle, Store, ShoppingCart } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useAuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { addSale, updateStock } from '../services/salesService';

const CartSidebar = ({ isOpen, onClose }) => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    discountAmount,
    total,
    applyDiscount,
  } = useCartContext();

  const { user } = useAuthContext();
  const [discountInput, setDiscountInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  const handleApplyDiscount = () => {
    const value = parseFloat(discountInput);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      applyDiscount(value);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    const saleId = `SALE-${String(Date.now()).slice(-6)}`;
    const newSale = {
      id: saleId,
      items: cartItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      subtotal,
      discount,
      total,
      paymentMethod,
      cashier: user?.name || 'Cashier',
      date: new Date(),
    };

    addSale(newSale);
    updateStock(cartItems);
    setLastSale(newSale);
    setShowReceipt(true);
    clearCart();
  };

  const handlePrint = () => {
    // Wait for render then print
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 100);
    });
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setLastSale(null);
    onClose();
  };

  if (!isOpen) return null;

  if (showReceipt && lastSale) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50" onClick={handleCloseReceipt} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 print:p-0" id="receipt-print">
              <div className="text-center mb-6">
                <Store className="w-10 h-10 mx-auto text-purple-600 mb-2" />
                <h2 className="text-xl font-bold text-gray-900">STORE-WISE</h2>
                <p className="text-xs text-gray-500 mt-1">POS & Inventory Management</p>
                <div className="mt-3 text-xs text-gray-400 space-y-0.5">
                  <p>123 Business Street, Lagos</p>
                  <p>Tel: +234 800 000 0000</p>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Receipt #: {lastSale.id}</span>
                  <span>{formatDate(lastSale.date)}</span>
                </div>
                <div className="text-xs text-gray-500">Cashier: {lastSale.cashier}</div>
                <div className="text-xs text-gray-500">Payment: {lastSale.paymentMethod}</div>
              </div>

              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500">
                    <th className="text-left py-2 font-medium">Item</th>
                    <th className="text-center py-2 font-medium">Qty</th>
                    <th className="text-right py-2 font-medium">Price</th>
                    <th className="text-right py-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lastSale.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-2 text-gray-800">{item.name}</td>
                      <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                      <td className="py-2 text-right text-gray-600">{formatCurrency(item.price)}</td>
                      <td className="py-2 text-right font-medium text-gray-800">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1.5 text-sm border-t border-dashed border-gray-300 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(lastSale.subtotal)}</span>
                </div>
                {lastSale.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({lastSale.discount}%)</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>TOTAL</span>
                  <span>{formatCurrency(lastSale.total)}</span>
                </div>
              </div>

              <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-300">
                <p className="text-xs text-gray-400">Thank you for your purchase!</p>
                <p className="text-xs text-gray-400 mt-1">Goods sold in good condition are not returnable</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-2 print:hidden">
              <button
                onClick={handleCloseReceipt}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Current Sale</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs mt-1">Add products to start selling</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded border border-gray-200 text-gray-600 hover:border-purple-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded border border-gray-200 text-gray-600 hover:border-purple-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <p className="text-sm font-bold text-purple-700">{formatCurrency(item.price * item.quantity)}</p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <input
              type="number"
              placeholder="Discount %"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleApplyDiscount}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
            >
              Apply
            </button>
          </div>

          {discount > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <Percent className="w-4 h-4" />
              <span>{discount}% discount applied</span>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-purple-700">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['Cash', 'Transfer', 'Card'].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                  paymentMethod === method
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearCart}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="flex-[2] py-3 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;