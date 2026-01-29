import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/shared/config/constants';

/**
 * Interface for the standard API error structure
 */
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/**
 * Create an Axios instance with centralized configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically handles the injection of authentication tokens
 */
apiClient.interceptors.request.use(
  (config) => {
    // Check for token in localStorage or sessionStorage (SSR safe check)
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('token') || sessionStorage.getItem('token')) 
      : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Handles data mapping, global error catching, and auto-logout (401)
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Returns the response directly for clean feature-level implementation
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // 1. Handle Authentication Errors (401 Unauthorized)
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      
      if (isAuthEndpoint) {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
          
          // Redirect to login page if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }

    // 2. Map error to a consistent object for UI usage (Toasts/Alerts)
    const customizedError: ApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      errors: error.response?.data?.errors,
    };

    // Developer logging for specific Network/CORS failures
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error('Network/CORS Error:', error.message);
      customizedError.message = 'Unable to connect to server. Please check your connection.';
      customizedError.status = 0;
    }

    return Promise.reject(customizedError);
  }
);

export default apiClient;
export { apiClient };