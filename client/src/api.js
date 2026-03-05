import axios from 'axios';

/**
 * Use environment variable for backend URL
 * Falls back to production URL for deployed builds
 */
const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://cybersafe-nexus.onrender.com'; 

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Injects Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handles 401 Session Expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const SILENT_ROUTES = ['/ai-assistant', '/live-alerts', '/tools/log-simulation', '/tools/security-logs'];
    
    if (originalRequest && SILENT_ROUTES.some(route => originalRequest.url.includes(route))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export default api;