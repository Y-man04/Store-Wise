import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartContext } from '../context/CartContext';
import { ShoppingCart, Search } from 'lucide-react';
import { products } from '../data/products';
import NotificationDropdown from '../components/NotificationDropdown';
import DarkModeToggle from '../components/DarkModeToggle';

const Navbar = () => {
  const { itemCount } = useCartContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const searchResults = searchQuery.length > 1 
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/pos');
      setShowResults(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <form onSubmit={handleSearch} className="relative w-96 max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Quick search products..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark:text-white"
          />
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
              {searchResults.map(product => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    navigate('/pos');
                    setShowResults(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm text-gray-700 dark:text-gray-300 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  <span className="font-medium">{product.name}</span>
                  <span className="text-gray-400 dark:text-gray-500 ml-2">— {product.category}</span>
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      <div className="flex items-center gap-3">
        <DarkModeToggle />
        <NotificationDropdown />

        <button 
          onClick={() => navigate('/pos#cart')}
          className="relative p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-purple-500 to-purple-700 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 animate-bounce">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;