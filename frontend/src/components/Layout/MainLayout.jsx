import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';

/**
 * Main application layout with sidebar navigation
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render in the main area (alternative to Outlet)
 */
const MainLayout = ({ children }) => {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Navigation */}
      <Navbar />
      
      {/* Main Content Area */}
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div className="h-full">
          {/* Use either Outlet (for routing) or direct children */}
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;