import axios from 'axios';
import { getAuthToken, setAuthToken, removeAuthToken } from './storage';

// API base URL - replace with your actual API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Create an axios instance with default configuration for user API calls
 */
const userApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Add authorization token to requests
 */
userApiClient.interceptors.request.use(
  config => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

/**
 * Error handling interceptor
 */
userApiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle common error cases
    if (error.response) {
      // Handle auth errors
      if (error.response.status === 401) {
        console.warn('Authentication error - user may need to log in again');
      }
    }
    return Promise.reject(error);
  }
);

/**
 * User login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Promise with user data and token
 */
export const login = async (email, password) => {
  try {
    const response = await userApiClient.post('/auth/login', { email, password });
    
    // Save auth token
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * User registration
 * @param {Object} userData - User registration data
 * @returns {Promise} Promise with user data and token
 */
export const register = async (userData) => {
  try {
    const response = await userApiClient.post('/auth/register', userData);
    
    // Save auth token if registration auto-logs in
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * User logout
 * @returns {Promise} Promise resolving to true on success
 */
export const logout = async () => {
  try {
    // Call logout endpoint if server needs to invalidate token
    await userApiClient.post('/auth/logout');
    
    // Remove token from storage
    removeAuthToken();
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still remove the token on error
    removeAuthToken();
    
    throw error;
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise} Promise resolving to true on success
 */
export const requestPasswordReset = async (email) => {
  try {
    await userApiClient.post('/auth/forgot-password', { email });
    return true;
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password
 * @returns {Promise} Promise resolving to true on success
 */
export const resetPassword = async (token, newPassword) => {
  try {
    await userApiClient.post('/auth/reset-password', { token, newPassword });
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Change password (when already logged in)
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} Promise resolving to true on success
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    await userApiClient.put('/users/password', { currentPassword, newPassword });
    return true;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

/**
 * Get current user profile
 * @returns {Promise} Promise with user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await userApiClient.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise} Promise with updated user data
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await userApiClient.put('/users/me', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Upload profile picture
 * @param {File} file - Image file
 * @returns {Promise} Promise with updated profile picture URL
 */
export const uploadProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await userApiClient.post('/users/me/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

/**
 * Update user status
 * @param {string} status - Status to set ('online', 'away', 'busy', 'offline')
 * @returns {Promise} Promise resolving to true on success
 */
export const updateStatus = async (status) => {
  try {
    await userApiClient.put('/users/me/status', { status });
    return true;
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
};

/**
 * Get user contacts (friends/connections)
 * @param {Object} params - Optional query parameters
 * @returns {Promise} Promise with contacts data
 */
export const getContacts = async (params = {}) => {
  try {
    const response = await userApiClient.get('/users/contacts', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

/**
 * Search for users
 * @param {string} query - Search query
 * @param {Object} params - Additional parameters
 * @returns {Promise} Promise with search results
 */
export const searchUsers = async (query, params = {}) => {
  try {
    const response = await userApiClient.get('/users/search', { 
      params: { 
        q: query,
        ...params
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise} Promise with user profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const response = await userApiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user profile for ${userId}:`, error);
    throw error;
  }
};

export default {
  login,
  register,
  logout,
  requestPasswordReset,
  resetPassword,
  changePassword,
  getCurrentUser,
  updateProfile,
  uploadProfilePicture,
  updateStatus,
  getContacts,
  searchUsers,
  getUserProfile
};