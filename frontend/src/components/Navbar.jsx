import React from 'react';
import { MessageCircle, Users, Bell, User, Search, Settings, Moon, Sun, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  { id: 'chats', name: 'Chats', icon: MessageCircle, path: '/chats' },
  { id: 'groups', name: 'Groups', icon: Users, path: '/groups' },
  { id: 'notifications', name: 'Notifications', icon: Bell, path: '/notifications' },
  { id: 'search', name: 'Search', icon: Search, path: '/search' },
  { id: 'profile', name: 'Profile', icon: User, path: '/profile' },
  { id: 'settings', name: 'Settings', icon: Settings, path: '/settings' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-6">
      {/* Logo */}
      <div className="mb-8">
        <div 
          className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center cursor-pointer"
          onClick={() => navigate('/chats')}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-8">
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors group relative
              ${location.pathname === item.path 
                ? 'bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-300'}`}
          >
            <item.icon className="w-6 h-6" />
            <span className="absolute left-full ml-4 bg-gray-900 dark:bg-gray-700 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {item.name}
            </span>
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto">
        <button 
          onClick={logout}
          className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 group relative"
        >
          <LogOut className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-300" />
          <span className="absolute left-full ml-4 bg-gray-900 dark:bg-gray-700 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;