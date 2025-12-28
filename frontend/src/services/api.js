import axios from 'axios';

/**
 * API Configuration for Production Deployment
 * 
 * IMPORTANT: Protocol enforcement happens in request interceptor
 * to ensure HTTPS is used in production environments
 */

// Determine the correct base URL based on environment
const getBaseURL = () => {
  // Get the configured backend URL from environment
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '/api';
  
  // If it's a relative URL, construct full URL with current protocol
  if (backendUrl.startsWith('/')) {
    if (typeof window !== 'undefined') {
      // Use the same protocol as the current page
      const protocol = window.location.protocol;
      const host = window.location.host;
      const fullUrl = `${protocol}//${host}${backendUrl}`;
      console.log('[API Config] Base URL constructed:', fullUrl);
      return fullUrl;
    }
    return backendUrl;
  }
  
  // If it's an absolute URL and we're on HTTPS, force HTTPS
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (backendUrl.startsWith('http://')) {
      const httpsUrl = backendUrl.replace('http://', 'https://');
      console.log('[API Config] Upgraded HTTP to HTTPS:', httpsUrl);
      return httpsUrl;
    }
  }
  
  return backendUrl;
};

// Create axios instance WITH proper baseURL
const api = axios.create({
  baseURL: getBaseURL(),
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

// Add token to requests and ensure HTTPS in production
api.interceptors.request.use(
  (config) => {
    // Double-check: If we're on HTTPS and somehow baseURL is HTTP, fix it
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      if (config.baseURL && config.baseURL.startsWith('http://')) {
        config.baseURL = config.baseURL.replace('http://', 'https://');
        console.log('[API Request] Force upgraded baseURL to HTTPS:', config.baseURL);
      }
    }
    
    // Check for both admin and client tokens
    const token = localStorage.getItem('admin_token') || 
                  localStorage.getItem('adminToken') || 
                  localStorage.getItem('client_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('[API Request]', config.method.toUpperCase(), config.url, 'Base:', config.baseURL);
    
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
