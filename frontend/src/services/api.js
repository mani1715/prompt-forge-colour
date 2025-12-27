import axios from 'axios';

/**
 * API Configuration for Production Deployment
 * 
 * LOCAL DEVELOPMENT (Kubernetes/Docker):
 *   REACT_APP_BACKEND_URL=/api
 *   Uses relative path, proxied by Kubernetes ingress
 * 
 * PRODUCTION (Vercel + Render):
 *   REACT_APP_BACKEND_URL=https://your-backend-name.onrender.com
 *   Uses absolute URL to Render backend (NOTE: Do NOT include /api suffix)
 */

const getApiBaseUrl = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  
  console.log('[API Config] Environment:', process.env.NODE_ENV);
  console.log('[API Config] REACT_APP_BACKEND_URL:', backendUrl);
  console.log('[API Config] Current origin:', window.location.origin);
  
  // Case 1: No environment variable set - use default relative path
  if (!backendUrl || backendUrl.trim() === '') {
    console.log('[API Config] ✅ Using default relative path: /api');
    return '/api';
  }
  
  // Case 2: Relative path (local development with K8s/Docker)
  if (backendUrl.startsWith('/')) {
    console.log('[API Config] ✅ Using relative path:', backendUrl);
    return backendUrl;
  }
  
  // Case 3: Absolute URL (production - Vercel + Render)
  let finalUrl = backendUrl;
  
  // Ensure HTTPS in production - ALWAYS match current page protocol
  if (window.location.protocol === 'https:') {
    if (finalUrl.startsWith('http://')) {
      finalUrl = finalUrl.replace('http://', 'https://');
      console.log('[API Config] ⚠️ Upgraded to HTTPS:', finalUrl);
    }
  }
  
  // Add /api suffix if not present
  if (!finalUrl.endsWith('/api')) {
    finalUrl = `${finalUrl}/api`;
    console.log('[API Config] 📝 Added /api suffix:', finalUrl);
  }
  
  console.log('[API Config] ✅ Final API Base URL:', finalUrl);
  return finalUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with optimized settings
const api = axios.create({
  baseURL: API_BASE_URL,
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

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
      if (currentPath.includes('/admin/login')) {
        return Promise.reject(error);
      }

      // Check if we have a token
      const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
      
      if (!token) {
        // No token, redirect to login
        window.location.href = '/admin/login';
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

      // Clear tokens and redirect
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      processQueue(error, null);
      isRefreshing = false;
      
      // Small delay to prevent multiple redirects
      setTimeout(() => {
        window.location.href = '/admin/login';
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
