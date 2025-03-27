import axios from 'axios';

export const getAuthToken = () => localStorage.getItem('token');

export const clearAuth = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Create axios instance with defaults
export const apiClient = axios.create({
  baseURL: '/api',  // Make sure this matches your Django URL configuration
  timeout: 15000,
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Profile API functions
export const updateProfile = async (formData) => {
  // This is the URL that needs to match your backend endpoint
  return apiClient.patch('/profile/', formData);
};

export const fetchProfile = async () => {
  return apiClient.get('/profile/');
};