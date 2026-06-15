import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('storewise_darkmode') === 'true' ||
      (!localStorage.getItem('storewise_darkmode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('storewise_darkmode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('storewise_darkmode', 'false');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className={`relative p-2.5 rounded-xl transition-all duration-300 ${
        isDark 
          ? 'bg-gray-800 text-yellow-400 shadow-lg shadow-yellow-400/20' 
          : 'bg-white text-gray-600 shadow-lg shadow-purple-500/20 hover:text-purple-600'
      }`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            isDark ? 'rotate-90 opacity-0 scale-0' : 'rotate-0 opacity-100 scale-100'
          }`} 
        />
        <Moon 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            isDark ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-0'
          }`} 
        />
      </div>
    </button>
  );
};

export default DarkModeToggle;