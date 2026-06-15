import { useState } from 'react';
import { Bell, X, AlertTriangle, Package, Calendar } from 'lucide-react';
import { products } from '../data/products';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const lowStock = products.filter(p => p.stock <= 20).slice(0, 5);
  const expired = products.filter(p => {
    if (!p.expiryDate) return false;
    return new Date(p.expiryDate) < new Date();
  }).slice(0, 5);

  const notifications = [
    ...lowStock.map(p => ({
      id: `stock-${p.id}`,
      type: 'stock',
      message: `${p.name} is low on stock (${p.stock} left)`,
      link: '/inventory',
      icon: Package,
      color: 'text-orange-600 bg-orange-50'
    })),
    ...expired.map(p => ({
      id: `expiry-${p.id}`,
      type: 'expiry',
      message: `${p.name} has expired`,
      link: '/pharmacy',
      icon: Calendar,
      color: 'text-red-600 bg-red-50'
    }))
  ];

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              <span className="text-xs text-gray-500">{unreadCount} alerts</span>
            </div>
            
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(note => {
                  const Icon = note.icon;
                  return (
                    <Link
                      key={note.id}
                      to={note.link}
                      onClick={() => setIsOpen(false)}
                      className="flex items-start gap-3 p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                    >
                      <div className={`p-2 rounded-lg ${note.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-snug">{note.message}</p>
                        <p className="text-xs text-gray-400 mt-1 capitalize">{note.type} alert</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;