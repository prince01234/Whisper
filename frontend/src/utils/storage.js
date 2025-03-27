/**
 * Storage utility module for managing localStorage and sessionStorage
 * with consistent error handling and prefixing
 */

// Application prefix to avoid collisions with other apps
const APP_PREFIX = 'whisper_';

/**
 * Get an item from localStorage
 * @param {string} key - Storage key (will be prefixed)
 * @param {*} defaultValue - Default value if item doesn't exist
 * @returns {*} Parsed value or defaultValue
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(`${APP_PREFIX}${key}`);
    return item !== null ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item "${key}" from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Set an item in localStorage
 * @param {string} key - Storage key (will be prefixed)
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} Success status
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(`${APP_PREFIX}${key}`, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item "${key}" in localStorage:`, error);
    
    // Check if the error is due to storage being full
    if (isQuotaExceededError(error)) {
      console.warn('Storage quota exceeded. Attempting to free up space...');
      
      // Attempt to clear older or less important data
      clearOldData();
      
      // Try again
      try {
        localStorage.setItem(`${APP_PREFIX}${key}`, JSON.stringify(value));
        return true;
      } catch (retryError) {
        console.error('Failed to store data even after clearing space:', retryError);
      }
    }
    
    return false;
  }
};

/**
 * Remove an item from localStorage
 * @param {string} key - Storage key (will be prefixed)
 * @returns {boolean} Success status
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(`${APP_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error(`Error removing item "${key}" from localStorage:`, error);
    return false;
  }
};

/**
 * Check if an item exists in localStorage
 * @param {string} key - Storage key (will be prefixed)
 * @returns {boolean} True if the item exists
 */
export const hasItem = (key) => {
  try {
    return localStorage.getItem(`${APP_PREFIX}${key}`) !== null;
  } catch (error) {
    console.error(`Error checking item "${key}" in localStorage:`, error);
    return false;
  }
};

/**
 * Clear all items with our app prefix from localStorage
 * @returns {boolean} Success status
 */
export const clearStorage = () => {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(APP_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Get all keys in localStorage with our app prefix
 * @returns {Array} Array of keys (without prefix)
 */
export const getAllKeys = () => {
  try {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(APP_PREFIX))
      .map(key => key.substring(APP_PREFIX.length));
  } catch (error) {
    console.error('Error getting all keys from localStorage:', error);
    return [];
  }
};

/**
 * Get total storage usage in bytes
 * @returns {number} Usage in bytes
 */
export const getStorageUsage = () => {
  try {
    let total = 0;
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(APP_PREFIX)) {
        total += (localStorage.getItem(key).length * 2); // UTF-16 uses 2 bytes per character
      }
    });
    
    return total;
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return 0;
  }
};

/**
 * Clear older data to free up space
 * This will remove older, less critical data
 */
const clearOldData = () => {
  try {
    // Example strategy: clear message drafts and cached data
    const keysToTryClear = [
      'message_drafts',
      'temp_files',
      'cached_messages',
      'search_history'
    ];
    
    keysToTryClear.forEach(key => {
      removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing old data:', error);
  }
};

/**
 * Check if an error is related to storage quota being exceeded
 * @param {Error} error - The error to check
 * @returns {boolean} True if it's a quota error
 */
const isQuotaExceededError = (error) => {
  return (
    error instanceof DOMException && 
    (error.code === 22 || // Chrome
     error.code === 1014 || // Firefox
     error.name === 'QuotaExceededError' || // Safari and some others
     error.name === 'NS_ERROR_DOM_QUOTA_REACHED') // Firefox
  );
};

// ============= Session Storage Functions =============

/**
 * Get an item from sessionStorage
 * @param {string} key - Storage key (will be prefixed)
 * @param {*} defaultValue - Default value if item doesn't exist
 * @returns {*} Parsed value or defaultValue
 */
export const getSessionItem = (key, defaultValue = null) => {
  try {
    const item = sessionStorage.getItem(`${APP_PREFIX}${key}`);
    return item !== null ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item "${key}" from sessionStorage:`, error);
    return defaultValue;
  }
};

/**
 * Set an item in sessionStorage
 * @param {string} key - Storage key (will be prefixed)
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} Success status
 */
export const setSessionItem = (key, value) => {
  try {
    sessionStorage.setItem(`${APP_PREFIX}${key}`, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item "${key}" in sessionStorage:`, error);
    return false;
  }
};

/**
 * Remove an item from sessionStorage
 * @param {string} key - Storage key (will be prefixed)
 * @returns {boolean} Success status
 */
export const removeSessionItem = (key) => {
  try {
    sessionStorage.removeItem(`${APP_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error(`Error removing item "${key}" from sessionStorage:`, error);
    return false;
  }
};

/**
 * Clear all items with our app prefix from sessionStorage
 * @returns {boolean} Success status
 */
export const clearSessionStorage = () => {
  try {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(APP_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
    return false;
  }
};

// ============= Common Application Storage Keys =============

// Auth-related storage methods
export const getAuthToken = () => getItem('auth_token');
export const setAuthToken = (token) => setItem('auth_token', token);
export const removeAuthToken = () => removeItem('auth_token');

// User settings
export const getUserSettings = () => getItem('user_settings', {});
export const setUserSettings = (settings) => setItem('user_settings', settings);

// Current user data
export const getCurrentUser = () => getItem('current_user');
export const setCurrentUser = (user) => setItem('current_user', user);
export const removeCurrentUser = () => removeItem('current_user');

// Message drafts
export const getMessageDraft = (conversationId) => {
  const drafts = getItem('message_drafts', {});
  return drafts[conversationId] || '';
};

export const setMessageDraft = (conversationId, text) => {
  const drafts = getItem('message_drafts', {});
  drafts[conversationId] = text;
  return setItem('message_drafts', drafts);
};

export const clearMessageDraft = (conversationId) => {
  const drafts = getItem('message_drafts', {});
  if (drafts[conversationId]) {
    delete drafts[conversationId];
    return setItem('message_drafts', drafts);
  }
  return true;
};

// Last active conversation
export const getLastActiveConversation = () => getItem('last_active_conversation');
export const setLastActiveConversation = (id) => setItem('last_active_conversation', id);

// Theme settings
export const getTheme = () => getItem('theme', 'light');
export const setTheme = (theme) => setItem('theme', theme);

// Notification settings
export const getNotificationSettings = () => getItem('notification_settings', { enabled: true, sound: true });
export const setNotificationSettings = (settings) => setItem('notification_settings', settings);

// Search history
export const getSearchHistory = () => getItem('search_history', []);
export const addSearchQuery = (query) => {
  const history = getSearchHistory();
  // Remove duplicates and add new query at the beginning
  const newHistory = [query, ...history.filter(q => q !== query)].slice(0, 10);
  return setItem('search_history', newHistory);
};
export const clearSearchHistory = () => setItem('search_history', []);

export default {
  // Local storage
  getItem,
  setItem,
  removeItem,
  hasItem,
  clearStorage,
  getAllKeys,
  getStorageUsage,
  
  // Session storage
  getSessionItem,
  setSessionItem,
  removeSessionItem,
  clearSessionStorage,
  
  // Auth
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  
  // User
  getCurrentUser,
  setCurrentUser,
  removeCurrentUser,
  
  // Settings
  getUserSettings,
  setUserSettings,
  getTheme,
  setTheme,
  getNotificationSettings,
  setNotificationSettings,
  
  // Chat
  getMessageDraft,
  setMessageDraft,
  clearMessageDraft,
  getLastActiveConversation,
  setLastActiveConversation,
  
  // Search
  getSearchHistory,
  addSearchQuery,
  clearSearchHistory
};