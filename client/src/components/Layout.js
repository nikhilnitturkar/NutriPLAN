import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Target, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import SettingsModal from './settings/Settings';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => {
    return window.location.pathname === path;
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, description: 'Overview & Analytics' },
    { name: 'Clients', href: '/clients', icon: Users, description: 'Manage Client Profiles' },
    { name: 'Diet Plans', href: '/diet-plans', icon: Target, description: 'Create & Manage Plans' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Performance Metrics' },
  ];

  return (
    <div className={`min-h-screen flex transition-all duration-500 ${
      isDarkMode 
        ? 'bg-black' 
        : 'bg-black'
    }`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-all duration-500 ease-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        isDarkMode 
          ? 'bg-black/95 backdrop-blur-xl border-r border-gray-800' 
          : 'bg-black/95 backdrop-blur-xl border-r border-gray-800'
      } shadow-2xl`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className={`flex items-center justify-between h-20 px-6 border-b border-gray-800`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <span className="text-2xl font-bold text-white">
                  NutriPlan
                </span>
                <p className="text-xs text-gray-400">
                  by A S T R A
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-4 py-4 text-sm font-medium rounded-lg transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-gray-800 text-white border-l-4 border-red-500'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 transition-all duration-300 ${
                      isActive(item.href) ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-300'
                    }`} />
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className={`text-xs ${
                        isActive(item.href) 
                          ? 'text-gray-400' 
                          : 'text-gray-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>


          </nav>

          {/* User Section */}
          <div className={`p-4 border-t border-gray-800`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">
                  {user?.name || 'Trainer'}
                </p>
                <p className="text-xs truncate text-gray-400">
                  {user?.email || 'trainer@example.com'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-800 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className={`sticky top-0 z-30 backdrop-blur-xl border-b border-gray-800 bg-black/95`}>
          <div className="flex items-center justify-between h-16 px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              {/* User Section */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {/* User Welcome */}
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      Welcome back, {user?.name || 'Trainer'}!
                    </p>
                    <p className="text-xs text-gray-400">
                      Ready to create amazing diet plans?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
};

export default Layout; 