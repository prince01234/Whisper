import axios from 'axios';
import { getAuthToken } from './storage';

// API base URL - replace with your actual API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Create an axios instance with default configuration for chat API calls
 */
const chatApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Add authorization token to requests
 */
chatApiClient.interceptors.request.use(
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
chatApiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle common error cases
    if (error.response) {
      // Server responded with an error status code
      console.error('API Error:', error.response.status, error.response.data);
      
      // Handle specific status codes
      if (error.response.status === 401) {
        // Unauthorized - could trigger logout or token refresh
        console.warn('Authentication error - user may need to log in again');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('API Request Error: No response received', error.request);
    } else {
      // Error setting up the request
      console.error('API Configuration Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Get all conversations for the current user
 * @param {Object} params - Optional query parameters
 * @returns {Promise} Promise with conversation data
 */
export const getConversations = async (params = {}) => {
  try {
    const response = await chatApiClient.get('/conversations', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Get a specific conversation by ID
 * @param {string} conversationId - The conversation ID
 * @returns {Promise} Promise with conversation data
 */
export const getConversation = async (conversationId) => {
  try {
    const response = await chatApiClient.get(`/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Create a new conversation
 * @param {Object} conversationData - Data for the new conversation
 * @param {string} conversationData.type - Type of conversation ('private' or 'group')
 * @param {Array} conversationData.participants - Array of participant IDs
 * @param {string} [conversationData.name] - Name for group conversations
 * @returns {Promise} Promise with the created conversation
 */
export const createConversation = async (conversationData) => {
  try {
    const response = await chatApiClient.post('/conversations', conversationData);
    return response.data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Get messages for a specific conversation
 * @param {string} conversationId - The conversation ID
 * @param {Object} params - Optional query parameters (limit, before, after)
 * @returns {Promise} Promise with message data
 */
export const getMessages = async (conversationId, params = {}) => {
  try {
    const response = await chatApiClient.get(
      `/conversations/${conversationId}/messages`, 
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Send a message in a conversation
 * @param {string} conversationId - The conversation ID
 * @param {Object} messageData - Message content and attachments
 * @param {string} messageData.content - Text content of the message
 * @param {Array} [messageData.attachments] - Array of attachment objects
 * @returns {Promise} Promise with the sent message data
 */
export const sendMessage = async (conversationId, messageData) => {
  try {
    const response = await chatApiClient.post(
      `/conversations/${conversationId}/messages`, 
      messageData
    );
    return response.data;
  } catch (error) {
    console.error(`Error sending message to conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Edit a message
 * @param {string} conversationId - The conversation ID
 * @param {string} messageId - The message ID to edit
 * @param {Object} messageData - Updated message data
 * @returns {Promise} Promise with the updated message
 */
export const editMessage = async (conversationId, messageId, messageData) => {
  try {
    const response = await chatApiClient.put(
      `/conversations/${conversationId}/messages/${messageId}`, 
      messageData
    );
    return response.data;
  } catch (error) {
    console.error(`Error editing message ${messageId}:`, error);
    throw error;
  }
};

/**
 * Delete a message
 * @param {string} conversationId - The conversation ID
 * @param {string} messageId - The message ID to delete
 * @returns {Promise} Promise resolving to true on success
 */
export const deleteMessage = async (conversationId, messageId) => {
  try {
    await chatApiClient.delete(`/conversations/${conversationId}/messages/${messageId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting message ${messageId}:`, error);
    throw error;
  }
};

/**
 * Mark messages in a conversation as read
 * @param {string} conversationId - The conversation ID
 * @returns {Promise} Promise resolving to true on success
 */
export const markConversationAsRead = async (conversationId) => {
  try {
    await chatApiClient.put(`/conversations/${conversationId}/read`);
    return true;
  } catch (error) {
    console.error(`Error marking conversation ${conversationId} as read:`, error);
    throw error;
  }
};

/**
 * Upload file attachments for messages
 * @param {File|Array} files - File object(s) to upload
 * @returns {Promise} Promise with attachment metadata
 */
export const uploadAttachments = async (files) => {
  try {
    const formData = new FormData();
    
    // Handle both single file and array of files
    if (Array.isArray(files)) {
      files.forEach((file) => {
        formData.append(`attachments`, file);
      });
    } else {
      formData.append('attachments', files);
    }
    
    const response = await chatApiClient.post('/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading attachments:', error);
    throw error;
  }
};

/**
 * Set typing indicator status
 * @param {string} conversationId - The conversation ID
 * @param {boolean} isTyping - Whether the user is typing
 * @returns {Promise} Promise resolving to true on success
 */
export const setTypingStatus = async (conversationId, isTyping) => {
  try {
    await chatApiClient.post(`/conversations/${conversationId}/typing`, { isTyping });
    return true;
  } catch (error) {
    console.error(`Error setting typing status in conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Search for messages in a conversation
 * @param {string} conversationId - The conversation ID
 * @param {string} query - Search query string
 * @returns {Promise} Promise with search results
 */
export const searchMessages = async (conversationId, query) => {
  try {
    const response = await chatApiClient.get(
      `/conversations/${conversationId}/messages/search`, 
      { params: { query } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error searching messages in conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Archive a conversation
 * @param {string} conversationId - The conversation ID
 * @returns {Promise} Promise resolving to true on success
 */
export const archiveConversation = async (conversationId) => {
  try {
    await chatApiClient.put(`/conversations/${conversationId}/archive`);
    return true;
  } catch (error) {
    console.error(`Error archiving conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Unarchive a conversation
 * @param {string} conversationId - The conversation ID
 * @returns {Promise} Promise resolving to true on success
 */
export const unarchiveConversation = async (conversationId) => {
  try {
    await chatApiClient.put(`/conversations/${conversationId}/unarchive`);
    return true;
  } catch (error) {
    console.error(`Error unarchiving conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Delete a conversation
 * @param {string} conversationId - The conversation ID
 * @returns {Promise} Promise resolving to true on success
 */
export const deleteConversation = async (conversationId) => {
  try {
    await chatApiClient.delete(`/conversations/${conversationId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Leave a group conversation
 * @param {string} conversationId - The group conversation ID
 * @returns {Promise} Promise resolving to true on success
 */
export const leaveConversation = async (conversationId) => {
  try {
    await chatApiClient.post(`/conversations/${conversationId}/leave`);
    return true;
  } catch (error) {
    console.error(`Error leaving conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Get chat statistics and unread counts
 * @returns {Promise} Promise with chat statistics
 */
export const getChatStatistics = async () => {
  try {
    const response = await chatApiClient.get('/conversations/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching chat statistics:', error);
    throw error;
  }
};

export default {
  getConversations,
  getConversation,
  createConversation,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markConversationAsRead,
  uploadAttachments,
  setTypingStatus,
  searchMessages,
  archiveConversation,
  unarchiveConversation,
  deleteConversation,
  leaveConversation,
  getChatStatistics
};