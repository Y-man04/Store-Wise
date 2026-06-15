import { Plus, Minus, ShoppingCart, Sparkles } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useState } from 'react';

const ProductCard = ({ product }) => {
  const { cartItems, addToCart, updateQuantity } = useCartContext();
  const [isHovered, setIsHovered] = useState(false);
  const cartItem = cartItems.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Beverages': 
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
          icon: '💧',
          accent: 'bg-blue-500'
        };
      case 'Groceries': 
        return {
          bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          text: 'text-green-700 dark:text-green-300',
          border: 'border-green-200 dark:border-green-800',
          icon: '🌾',
          accent: 'bg-green-500'
        };
      case 'Pharmacy': 
        return {
          bg: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
          text: 'text-red-700 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800',
          icon: '💊',
          accent: 'bg-red-500'
        };
      default: 
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800',
          text: 'text-gray-700 dark:text-gray-300',
          border: 'border-gray-200 dark:border-gray-700',
          icon: '📦',
          accent: 'bg-gray-500'
        };
    }
  };

  const style = getCategoryStyle(product.category);

  return (
    <div 
      className={`card overflow-hidden group cursor-pointer transition-all duration-300 ${isHovered ? 'scale-[1.02] shadow-xl' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Area with Gradient */}
      <div className={`h-36 ${style.bg} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.3),transparent_70%)]" />
        <div className="text-center relative z-10">
          <span className="text-5xl filter drop-shadow-lg animate-float">{style.icon}</span>
          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${style.text} bg-white/80 dark:bg-black/40 backdrop-blur-sm border ${style.border}`}>
            {product.category}
          </div>
        </div>

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/5 dark:bg-white/5 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          {product.stock <= 20 && (
            <span className="shrink-0 ml-2 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-bold rounded-full animate-pulse-soft">
              Low
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Stock: <span className={`font-semibold ${product.stock <= 20 ? 'text-orange-500' : 'text-green-500'}`}>{product.stock}</span>
          </span>
          {product.expiryDate && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Exp: {product.expiryDate}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 line-through">
              {formatCurrency(product.price * 1.2)}
            </p>
            <p className="text-xl font-bold text-purple-700 dark:text-purple-400">
              {formatCurrency(product.price)}
            </p>
          </div>

          {quantity === 0 ? (
            <button
              onClick={() => addToCart(product)}
              className={`flex items-center gap-1.5 ${style.accent} hover:brightness-110 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-200 hover:scale-105 active:scale-95`}
            >
              <ShoppingCart className="w-4 h-4" />
              Add
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl p-1 border border-purple-200 dark:border-purple-800">
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-7 text-center text-sm font-bold text-purple-700 dark:text-purple-300">{quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;