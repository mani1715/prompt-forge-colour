import axios from 'axios';

/**
 * API SERVICE - KUBERNETES INGRESS COMPATIBLE
 * 
 * For Emergent/Kubernetes deployment:
 * - Uses REACT_APP_BACKEND_URL from .env (defaults to /api)
 * - Kubernetes ingress routes /api/* to backend service on port 8001
 * - Uses relative URLs for proper routing through ingress
 */

// Get backend URL from environment variable
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';

// Create axios instance with proper baseURL
const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second default timeout
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add token to requests and construct full URL with correct protocol
api.interceptors.request.use(
  (config) => {
    // CRITICAL FIX: Construct full URL with current page's protocol
    // This prevents mixed content errors in production (HTTPS)
    
    if (config.url) {
      // If URL already has protocol, force HTTPS if page is HTTPS
      if (config.url.startsWith('http://') || config.url.startsWith('https://')) {
        if (window.location.protocol === 'https:' && config.url.startsWith('http://')) {
          config.url = config.url.replace('http://', 'https://');
          console.warn('[API Security] FORCED HTTP→HTTPS upgrade:', config.url);
        }
      } 
      // If relative URL, construct full URL with page's protocol
      else {
        const protocol = window.location.protocol; // 'https:' or 'http:'
        const host = window.location.host; // domain with port
        
        // Ensure URL starts with /api
        let path = config.url;
        if (!path.startsWith('/api')) {
          path = '/api' + (path.startsWith('/') ? '' : '/') + path;
        }
        
        // Construct full URL with correct protocol
        const fullUrl = `${protocol}//${host}${path}`;
        config.url = fullUrl;
        
        console.log('[API] Constructed URL:', fullUrl);
      }
    }
    
    // Check for both admin and client tokens
    const token = localStorage.getItem('admin_token') || 
                  localStorage.getItem('adminToken') || 
                  localStorage.getItem('client_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('[API Request]', config.method?.toUpperCase(), config.url);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors with improved logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      const currentPath = window.location.pathname;
      
      // If already on login page, don't redirect
      if (currentPath.includes('/admin/login') || currentPath.includes('/client/login')) {
        return Promise.reject(error);
      }

      // Check if we have a token
      const adminToken = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
      const clientToken = localStorage.getItem('client_token');
      
      if (!adminToken && !clientToken) {
        // No token, redirect to appropriate login based on current path
        if (currentPath.includes('/client')) {
          window.location.href = '/client/login';
        } else {
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }

      // If already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Clear tokens and redirect to appropriate login
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('client_token');
      localStorage.removeItem('client_data');
      
      processQueue(error, null);
      isRefreshing = false;
      
      // Small delay to prevent multiple redirects
      setTimeout(() => {
        if (currentPath.includes('/client')) {
          window.location.href = '/client/login';
        } else {
          window.location.href = '/admin/login';
        }
      }, 100);
      
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      error.message = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  }
);

export default api;
