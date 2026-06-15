import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useEffect, useState } from 'react';

const AppLayout = () => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 transition-all duration-300" style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}>
        <Navbar />
        <main className="p-6">
          <div 
            className={`transition-all duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;