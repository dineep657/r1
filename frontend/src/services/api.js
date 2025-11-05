import axios from 'axios';

// Prefer env, but in production fallback to the Render backend if not provided
const inferApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim();
  const isProd = typeof window !== 'undefined' && window.location.hostname && window.location.hostname.includes('vercel.app');
  if (isProd) {
    return 'https://realtime-code-backend-upxc.onrender.com';
  }
  return '/api'; // dev proxy
};

const API_URL = inferApiUrl();

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
        message: `Unable to connect to server. Check API availability at ${API_URL}.`,
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