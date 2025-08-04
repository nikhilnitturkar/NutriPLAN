import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Target, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  // Close sidebar when location changes (mobile)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Diet Plans', href: '/diet-plans', icon: Target },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-gray-900/95 border border-gray-800 text-gray-300 hover:text-white transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-14 lg:h-16 px-4 lg:px-6 border-b border-gray-800">
            <h1 className="text-lg lg:text-xl font-bold text-white text-center">NutriPlan by A S T R A</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 lg:px-4 py-4 lg:py-6 space-y-1 lg:space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-3 lg:p-4 border-t border-gray-800">
            <div className="flex items-center px-3 lg:px-4 py-2 lg:py-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-xs lg:text-sm font-semibold text-white">
                    {user?.name?.charAt(0) || 'T'}
                  </span>
                </div>
              </div>
              <div className="ml-2 lg:ml-3 flex-1 min-w-0">
                <p className="text-xs lg:text-sm font-medium text-white truncate">
                  {user?.name || 'Trainer'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email || 'trainer@nutriplan.com'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200"
            >
              <LogOut className="mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onTouchStart={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 