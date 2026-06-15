import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { Store, Scissors } from 'lucide-react';

const Receipt = ({ sale, cashierName = 'Cashier' }) => {
  return (
    <div className="bg-white p-6 max-w-sm mx-auto relative">
      {/* Torn edge effect top */}
      <div className="absolute -top-3 left-0 right-0 h-4 bg-white" 
        style={{ 
          maskImage: 'repeating-linear-gradient(45deg, transparent 5px, black 5px, black 10px, transparent 10px)',
          WebkitMaskImage: 'repeating-linear-gradient(45deg, transparent 5px, black 5px, black 10px, transparent 10px)',
          transform: 'rotate(180deg)'
        }} 
      />

      {/* Receipt content */}
      <div className="text-center mb-6 pt-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30">
          <Store className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Store-Wise</h2>
        <p className="text-xs text-gray-500 mt-1 font-medium">POS & Inventory Management</p>
        <div className="mt-3 text-xs text-gray-400 space-y-0.5">
          <p>123 Business Street, Lagos, Nigeria</p>
          <p>Tel: +234 800 000 0000</p>
          <p>store-wise.ng</p>
        </div>
      </div>

      {/* Divider with scissors */}
      <div className="flex items-center gap-2 my-4">
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        <Scissors className="w-4 h-4 text-gray-400 rotate-180" />
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
      </div>

      <div className="mb-4 text-xs space-y-1">
        <div className="flex justify-between text-gray-600">
          <span className="font-medium">Receipt #:</span>
          <span className="font-mono font-bold">{sale.id}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="font-medium">Date:</span>
          <span>{formatDate(sale.date)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="font-medium">Cashier:</span>
          <span className="font-medium">{cashierName}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="font-medium">Payment:</span>
          <span className={`font-bold ${
            sale.paymentMethod === 'Cash' ? 'text-green-600' :
            sale.paymentMethod === 'Card' ? 'text-blue-600' :
            'text-purple-600'
          }`}>{sale.paymentMethod}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-dashed border-gray-300 my-4" />

      {/* Items Table */}
      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="border-b-2 border-dashed border-gray-300 text-xs text-gray-500">
            <th className="text-left py-2 font-bold">Item</th>
            <th className="text-center py-2 font-bold">Qty</th>
            <th className="text-right py-2 font-bold">Price</th>
            <th className="text-right py-2 font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, idx) => (
            <tr key={idx} className="border-b border-dashed border-gray-200">
              <td className="py-2 text-gray-800 font-medium text-xs">{item.name}</td>
              <td className="py-2 text-center text-gray-600 font-bold">{item.quantity}</td>
              <td className="py-2 text-right text-gray-600 text-xs">{formatCurrency(item.price)}</td>
              <td className="py-2 text-right font-bold text-gray-800">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Divider */}
      <div className="border-t-2 border-dashed border-gray-300 my-4" />

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span className="font-medium">Subtotal</span>
          <span className="font-mono">{formatCurrency(sale.subtotal)}</span>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span className="font-medium">Discount ({sale.discount}%)</span>
            <span className="font-mono font-bold">-{formatCurrency((sale.subtotal * sale.discount) / 100)}</span>
          </div>
        )}
        <div className="flex justify-between text-xl font-black text-gray-900 pt-3 border-t-2 border-gray-800">
          <span>TOTAL</span>
          <span className="font-mono">{formatCurrency(sale.total)}</span>
        </div>
      </div>

      {/* Barcode placeholder */}
      <div className="mt-6 flex justify-center">
        <div className="flex gap-0.5">
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i} 
              className="bg-gray-800" 
              style={{ 
                width: `${Math.random() > 0.5 ? 2 : 1}px`, 
                height: '40px' 
              }} 
            />
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-1 font-mono tracking-widest">{sale.id}</p>

      {/* Footer */}
      <div className="text-center mt-6 pt-4 border-t-2 border-dashed border-gray-300">
        <p className="text-sm font-bold text-gray-800">Thank you for your purchase!</p>
        <p className="text-xs text-gray-400 mt-2">Goods sold in good condition are not returnable</p>
        <p className="text-xs text-gray-400 mt-1">Please keep this receipt for your records</p>
      </div>

      {/* Torn edge effect bottom */}
      <div className="absolute -bottom-3 left-0 right-0 h-4 bg-white" 
        style={{ 
          maskImage: 'repeating-linear-gradient(45deg, transparent 5px, black 5px, black 10px, transparent 10px)',
          WebkitMaskImage: 'repeating-linear-gradient(45deg, transparent 5px, black 5px, black 10px, transparent 10px)'
        }} 
      />
    </div>
  );
};

export default Receipt;