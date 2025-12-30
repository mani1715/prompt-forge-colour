"""
Enhanced API Service with Advanced Features
Production-ready Axios configuration with:
- JWT token management
- Request/response interceptors
- Error handling
- Retry logic
- Request cancellation
- HTTPS enforcement
"""
import axios from 'axios';

// ============================================================================
// CONFIGURATION
// ============================================================================

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
const API_VERSION = process.env.REACT_APP_API_VERSION || 'v1';
const BASE_URL = BACKEND_URL.endsWith('/') 
  ? `${BACKEND_URL}${API_VERSION}` 
  : `${BACKEND_URL}/${API_VERSION}`;

// Force HTTPS in production
let finalBaseURL = BASE_URL;
if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
  if (finalBaseURL.startsWith('http://')) {
    finalBaseURL = finalBaseURL.replace('http://', 'https://');
    console.warn('[API] Upgraded HTTP baseURL to HTTPS:', finalBaseURL);
  }
}

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

const api = axios.create({
  baseURL: finalBaseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

const TokenManager = {
  getAdminToken: () => localStorage.getItem('admin_token') || localStorage.getItem('adminToken'),
  getClientToken: () => localStorage.getItem('client_token'),
  setAdminToken: (token) => localStorage.setItem('admin_token', token),
  setClientToken: (token) => localStorage.setItem('client_token', token),
  removeAdminToken: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },
  removeClientToken: () => {
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_data');
  },
  clearAll: () => {
    TokenManager.removeAdminToken();
    TokenManager.removeClientToken();
  },
  getActiveToken: () => {
    return TokenManager.getAdminToken() || TokenManager.getClientToken();
  },
};

// ============================================================================
// REQUEST CANCELLATION
// ============================================================================

const CancelToken = axios.CancelToken;
const pendingRequests = new Map();

const addPendingRequest = (config) => {
  const requestKey = `${config.method}_${config.url}`;
  config.cancelToken = new CancelToken((cancel) => {
    if (!pendingRequests.has(requestKey)) {
      pendingRequests.set(requestKey, cancel);
    }
  });
};

const removePendingRequest = (config) => {
  const requestKey = `${config.method}_${config.url}`;
  if (pendingRequests.has(requestKey)) {
    const cancel = pendingRequests.get(requestKey);
    cancel(requestKey);
    pendingRequests.delete(requestKey);
  }
};

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

api.interceptors.request.use(
  (config) => {
    // Cancel duplicate requests
    removePendingRequest(config);
    addPendingRequest(config);
    
    // Add authentication token
    const token = TokenManager.getActiveToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Enforce HTTPS in production
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      if (config.baseURL && config.baseURL.startsWith('http://')) {
        config.baseURL = config.baseURL.replace('http://', 'https://');
      }
      if (config.url && config.url.startsWith('http://')) {
        config.url = config.url.replace('http://', 'https://');
      }
    }
    
    // Add request ID for tracing
    config.headers['X-Client-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        config.data ? { data: config.data } : ''
      );
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Remove completed request from pending
    removePendingRequest(response.config);
    
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data
      );
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Remove failed request from pending
    if (originalRequest) {
      removePendingRequest(originalRequest);
    }
    
    // Handle cancelled requests
    if (axios.isCancel(error)) {
      console.log('[API] Request cancelled:', error.message);
      return Promise.reject(error);
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('[API] Network error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        type: 'NETWORK_ERROR',
      });
    }
    
    const { status } = error.response;
    
    // Handle 401 Unauthorized
    if (status === 401 && !originalRequest._retry) {
      const currentPath = window.location.pathname;
      
      // Skip if already on login page
      if (currentPath.includes('/login')) {
        return Promise.reject(error);
      }
      
      // Check if we have a token
      const hasToken = TokenManager.getActiveToken();
      
      if (!hasToken) {
        // No token, redirect to appropriate login
        redirectToLogin(currentPath);
        return Promise.reject(error);
      }
      
      // If already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      // Clear tokens and redirect
      TokenManager.clearAll();
      processQueue(error, null);
      isRefreshing = false;
      
      setTimeout(() => redirectToLogin(currentPath), 100);
      return Promise.reject(error);
    }
    
    // Handle 403 Forbidden
    if (status === 403) {
      console.error('[API] Access forbidden:', error.response.data);
      return Promise.reject({
        message: 'You do not have permission to perform this action.',
        type: 'PERMISSION_DENIED',
        ...error.response.data,
      });
    }
    
    // Handle 404 Not Found
    if (status === 404) {
      console.error('[API] Resource not found:', error.response.data);
      return Promise.reject({
        message: 'Resource not found.',
        type: 'NOT_FOUND',
        ...error.response.data,
      });
    }
    
    // Handle 429 Rate Limit
    if (status === 429) {
      console.error('[API] Rate limit exceeded');
      return Promise.reject({
        message: 'Too many requests. Please try again later.',
        type: 'RATE_LIMIT',
      });
    }
    
    // Handle 500+ Server Errors
    if (status >= 500) {
      console.error('[API] Server error:', error.response.data);
      return Promise.reject({
        message: 'Server error. Please try again later.',
        type: 'SERVER_ERROR',
        ...error.response.data,
      });
    }
    
    // Log other errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        status,
        url: originalRequest?.url,
        data: error.response.data,
      });
    }
    
    return Promise.reject(error);
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const redirectToLogin = (currentPath) => {
  if (currentPath.includes('/client')) {
    window.location.href = '/client/login';
  } else if (currentPath.includes('/admin')) {
    window.location.href = '/admin/login';
  }
};

// ============================================================================
// RETRY LOGIC
// ============================================================================

const retryRequest = (config, maxRetries = 3, delay = 1000) => {
  return new Promise((resolve, reject) => {
    const attempt = (retriesLeft) => {
      api(config)
        .then(resolve)
        .catch((error) => {
          if (retriesLeft === 0 || error.response?.status < 500) {
            reject(error);
          } else {
            console.log(`[API] Retrying request... (${maxRetries - retriesLeft + 1}/${maxRetries})`);
            setTimeout(() => attempt(retriesLeft - 1), delay);
          }
        });
    };
    attempt(maxRetries);
  });
};

// ============================================================================
// EXPORTS
// ============================================================================

export default api;
export { TokenManager, retryRequest, CancelToken };
