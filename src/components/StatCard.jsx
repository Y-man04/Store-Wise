import { useEffect, useState } from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'purple', trend = null }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    setIsVisible(true);
    // Animate number counting
    const valueStr = String(value);
    const numericValue = parseFloat(valueStr.replace(/[^0-9.]/g, ''));
    if (!isNaN(numericValue)) {
      let start = 0;
      const duration = 1000;
      const increment = numericValue / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          setDisplayValue(valueStr);
          clearInterval(timer);
        } else {
          setDisplayValue(valueStr.replace(String(numericValue), Math.floor(start).toLocaleString()));
        }
      }, 16);
      return () => clearInterval(timer);
    } else {
      setDisplayValue(valueStr);
    }
  }, [value]);

  const colors = {
    purple: 'from-purple-500 to-purple-700 shadow-purple-500/30',
    green: 'from-emerald-500 to-emerald-700 shadow-emerald-500/30',
    blue: 'from-blue-500 to-blue-700 shadow-blue-500/30',
    orange: 'from-orange-500 to-orange-700 shadow-orange-500/30',
    red: 'from-red-500 to-red-700 shadow-red-500/30',
    pink: 'from-pink-500 to-pink-700 shadow-pink-500/30',
  };

  const bgColors = {
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    green: 'bg-emerald-50 dark:bg-emerald-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    orange: 'bg-orange-50 dark:bg-orange-900/20',
    red: 'bg-red-50 dark:bg-red-900/20',
    pink: 'bg-pink-50 dark:bg-pink-900/20',
  };

  return (
    <div 
      className={`card p-5 hover:shadow-lg transition-all duration-300 animate-slide-up ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ animationDelay: `${Math.random() * 0.3}s` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{displayValue}</p>
          {subtitle && (
            <p className="text-xs mt-2 text-gray-500 dark:text-gray-400 flex items-center gap-1">
              {trend && (
                <span className={`text-xs font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
              )}
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${bgColors[color]} flex items-center justify-center shadow-lg ${colors[color]}`}>
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;