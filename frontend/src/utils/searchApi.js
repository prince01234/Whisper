// import { apiClient } from './api';

// export const performSearch = async (query, type = 'all') => {
//   try {
//     const params = { q: query };
//     if (type !== 'all') {
//       params.type = type;
//     }
    
//     const response = await apiClient.get('/search/', { params });
//     return response.data;
//   } catch (error) {
//     console.error('Search error:', error);
//     throw error;
//   }
// };

import { apiClient } from './api';

/**
 * Perform a search query
 * @param {string} query - The search query text
 * @param {string} type - Optional filter for search type (all, users, posts)
 * @returns {Promise<Object>} - Search results from the API
 */
export const performSearch = async (query, type = 'all') => {
  try {
    const params = { q: query };
    if (type !== 'all') {
      params.type = type;
    }
    
    try {
      // Attempt to use the real API
      const response = await apiClient.get('/search/', { params });
      return response.data;
    } catch (apiError) {
      console.warn('Search API not available yet:', apiError.message);
      // Use placeholder data while backend is being developed
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            users: [],
            posts: []
          });
        }, 500);
      });
    }
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};