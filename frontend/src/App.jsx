import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import AuthLayout from './components/AuthLayout';
import Navbar from './components/Navbar';
import SettingsView from './pages/SettingsView'; 
import ProfileView from './pages/ProfileView';
import ProfileSetup from './components/ProfileSetup'; // Import the new component

// Import placeholder components for other routes
const ChatsView = () => <div className="flex-1 p-6">Chats View</div>; 
const GroupsView = () => <div className="flex-1 p-6">Groups View</div>;
const NotificationsView = () => <div className="flex-1 p-6">Notifications View</div>;
const SearchView = () => <div className="flex-1 p-6">Search View</div>;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );
  
  // Check if user is already authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      
      // Check if user needs profile setup (get this from local storage)
      const profileSetupNeeded = localStorage.getItem('needsProfileSetup') === 'true';
      setNeedsProfileSetup(profileSetupNeeded);
    }
  }, []);
  
  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Save preference to localStorage
    localStorage.setItem('darkMode', !isDarkMode);
  };

  // Function to handle successful profile setup
  const handleProfileSetupComplete = () => {
    localStorage.removeItem('needsProfileSetup');
    setNeedsProfileSetup(false);
  };
  
  // Function to handle skipping profile setup
  const handleProfileSetupSkip = () => {
    localStorage.removeItem('needsProfileSetup');
    setNeedsProfileSetup(false);
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('needsProfileSetup');
    setIsAuthenticated(false);
    setNeedsProfileSetup(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      setIsAuthenticated,
      setNeedsProfileSetup,
      logout
    }}>
      <div className={isDarkMode ? 'dark' : ''}>
        <Router>
          {!isAuthenticated ? (
            <Routes>
              <Route path="*" element={<AuthLayout />} />
            </Routes>
          ) : needsProfileSetup ? (
            <Routes>
              <Route 
                path="*" 
                element={<ProfileSetup onComplete={handleProfileSetupComplete} onSkip={handleProfileSetupSkip} />} 
              />
            </Routes>
          ) : (
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <Navbar 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode} 
              />
              <Routes>
                <Route path="/" element={<Navigate to="/chats" replace />} />
                <Route path="/chats" element={<ChatsView />} />
                <Route path="/groups" element={<GroupsView />} />
                <Route path="/notifications" element={<NotificationsView />} />
                <Route path="/search" element={<SearchView />} />
                <Route path="/profile" element={<ProfileView />} />
                <Route path="/settings" element={<SettingsView isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
                <Route path="*" element={<Navigate to="/chats" replace />} />
              </Routes>
            </div>
          )}
        </Router>
      </div>
    </AuthContext.Provider>
  );
}

export default App;