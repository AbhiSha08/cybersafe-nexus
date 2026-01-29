import axios from 'axios';

/**
 * Standardized Base URL for Mumbai University Project
 * Uses VITE_API_URL from .env or Vercel Settings
 * Fallback to localhost only for local development
 */
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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

// Response Interceptor: Handles 401 Session Expiration and Silent Route preservation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // --- CRITICAL FIX: SILENT ROUTES ---
    // Prevent SIEM logging or background AI failures from wiping the UI state 
    // or triggering global error redirects.
    const SILENT_ROUTES = [
      '/ai-assistant', 
      '/live-alerts', 
      '/tools/log-simulation', 
      '/tools/security-logs'
    ];
    
    if (originalRequest && SILENT_ROUTES.some(route => originalRequest.url.includes(route))) {
      console.warn(`Silent background error handled for: ${originalRequest.url}`);
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized for MAIN requests
    if (error.response?.status === 401) {
      const authPages = ['/login', '/register', '/forgot-password'];
      const isAuthPage = authPages.some(path => window.location.pathname.includes(path));

      if (!isAuthPage) {
        console.warn("Session Expired. Redirecting to login node.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;