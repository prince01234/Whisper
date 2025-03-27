import React, { useState, useEffect } from 'react';

/**
 * A split pane layout with a sidebar and main content area
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.sidebar - Content to render in the sidebar
 * @param {React.ReactNode} props.main - Content to render in the main area
 * @param {string} props.sidebarWidth - Width of the sidebar (tailwind width class)
 * @param {boolean} props.collapsible - Whether the sidebar can be collapsed
 * @param {boolean} props.defaultCollapsed - Whether the sidebar should start collapsed
 * @param {boolean} props.mobileView - Whether we're currently in a mobile view
 * @param {boolean} props.sidebarVisible - Whether the sidebar is visible (for mobile)
 * @param {Function} props.onToggleSidebar - Callback when sidebar is toggled
 */
const SplitPane = ({
  sidebar,
  main,
  sidebarWidth = 'w-80',
  collapsible = false,
  defaultCollapsed = false,
  mobileView = false,
  sidebarVisible = true,
  onToggleSidebar = null
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  
  // Update internal collapsed state when defaultCollapsed changes
  useEffect(() => {
    setCollapsed(defaultCollapsed);
  }, [defaultCollapsed]);
  
  // Handle sidebar toggle
  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    
    if (onToggleSidebar) {
      onToggleSidebar(newState);
    }
  };
  
  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`
          h-full border-r border-gray-200 dark:border-gray-700 transition-all duration-300 bg-white dark:bg-gray-800
          ${mobileView ? 'absolute z-30 inset-y-0 left-0' : 'relative'}
          ${collapsed ? 'w-0 -ml-5 opacity-0' : sidebarWidth}
          ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebar}
      </div>
      
      {/* Toggle button - only if collapsible */}
      {collapsible && !mobileView && (
        <button
          type="button"
          onClick={toggleSidebar}
          className={`
            absolute top-4 z-40 rounded-full w-5 h-10 bg-gray-200 dark:bg-gray-700 
            flex items-center justify-center
            hover:bg-gray-300 dark:hover:bg-gray-600 transition-all
            ${collapsed ? 'left-1' : `left-[calc(${sidebarWidth.replace('w-', '')}rem_-_0.625rem)]`}
          `}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg 
            className={`w-3 h-3 text-gray-600 dark:text-gray-300 transition-transform ${collapsed ? 'rotate-0' : 'rotate-180'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      {/* Mobile overlay - only when sidebar is visible */}
      {mobileView && sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onToggleSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Main content */}
      <div className="flex-1 overflow-auto relative">
        {main}
      </div>
    </div>
  );
};

export default SplitPane;