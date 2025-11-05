import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Normalize error responses so components can show meaningful messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (server not reachable)
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
      const normalized = {
        status: 0,
        data: null,
        message: 'Unable to connect to server. Please ensure the backend server is running on port 5001.',
      };
      console.error('Network error:', error.message);
      return Promise.reject(normalized);
    }
    
    const normalized = {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.response?.data?.message || error?.message || 'Network error',
    };
    return Promise.reject(normalized);
  }
);

// Auth APIs
export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export default api;