import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext.jsx';
import AuthLayout from './components/AuthLayout';
import Navbar from './components/Navbar';
import SettingsView from './pages/SettingsView'; 
import ProfileView from './pages/ProfileView';
import ProfileSetup from './components/ProfileSetup'; 
import SearchPage from './pages/SearchPage';
import ChatPage from './pages/ChatPage'; // Import the ChatPage component

// Import placeholder components for other routes
const GroupsView = () => <div className="flex-1 p-6">Groups View</div>;
const NotificationsView = () => <div className="flex-1 p-6">Notifications View</div>;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );
  const [currentUser, setCurrentUser] = useState(null);
  
  // Check if user is already authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      
      // Check if user needs profile setup
      const profileSetupNeeded = localStorage.getItem('needsProfileSetup') === 'true';
      setNeedsProfileSetup(profileSetupNeeded);
      
      // Load user data from local storage if available
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          setCurrentUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
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

  // Function to handle profile setup completion
  const handleProfileSetupComplete = (userData) => {
    localStorage.removeItem('needsProfileSetup');
    setNeedsProfileSetup(false);
    
    // Save the user data
    if (userData) {
      setCurrentUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
    }
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
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setNeedsProfileSetup(false);
    setCurrentUser(null);
  };

  // Function to update user data
  const updateUser = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      setIsAuthenticated,
      needsProfileSetup,
      setNeedsProfileSetup,
      currentUser,
      updateUser,
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
                user={currentUser}
              />
              <Routes>
                <Route path="/" element={<Navigate to="/chat" replace />} />
                
                {/* Chat routes */}
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chat/:conversationId" element={<ChatPage />} />
                
                {/* Other app routes */}
                <Route path="/groups" element={<GroupsView />} />
                <Route path="/notifications" element={<NotificationsView />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/profile" element={<ProfileView />} />
                <Route path="/settings" element={<SettingsView isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/chat" replace />} />
              </Routes>
            </div>
          )}
        </Router>
      </div>
    </AuthContext.Provider>
  );
}

export default App;