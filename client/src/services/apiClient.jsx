import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create an axios instance
const client = axios.create({
  baseURL: API_URL
});

export default client;

// Helper function to clear all authentication data
function clearAllAuthData() {
  // Clear all possible auth-related localStorage items
  localStorage.removeItem('authToken');
  localStorage.removeItem('tokenExpiration');
  
  // Clear user-specific data
  localStorage.removeItem('user');
  localStorage.removeItem('userMembership');
  localStorage.removeItem('userCardNumber');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userPhoneNumber');
  localStorage.removeItem('password');
  
  // Clear manager-specific data
  localStorage.removeItem('managerID');
  localStorage.removeItem('managerName');
  localStorage.removeItem('managerUsername');
  
  // Clear autovip user-specific data
  localStorage.removeItem('autovipUserID');
  localStorage.removeItem('autovipUserName');
  localStorage.removeItem('autovipUserCardNumber');
  localStorage.removeItem('autovipUserRucCi');
}

// Helper function to determine login redirect path based on user type
// Must be called BEFORE clearing auth data
function getLoginRedirectPath() {
  const currentPath = window.location.pathname;
  
  // If already on a login page, don't redirect
  if (currentPath.includes('/login') || currentPath.includes('/manager-login')) {
    return null;
  }
  
  // Check if user is a manager (check before clearing data)
  const managerID = localStorage.getItem('managerID');
  if (managerID) {
    return '/manager-login';
  }
  
  // Default to regular user login
  return '/login';
}

// Add request interceptor to include auth token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401/403 errors globally
client.interceptors.response.use(
  (response) => {
    // If response is successful, return it as-is
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      // Network error or server unreachable
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const config = error.config;

    // Handle 401 (Unauthorized) and 403 (Forbidden) errors
    if (status === 401 || status === 403) {
      // Determine redirect path BEFORE clearing auth data (needed to check user type)
      const redirectPath = getLoginRedirectPath();
      
      // Check if this is a login request to prevent redirect loops
      const isLoginRequest = config?.url?.includes('/login') || 
                            config?.url?.includes('/autovip-users/login') ||
                            config?.url?.includes('/managers/login') ||
                            config?.url?.includes('/users/login');
      
      // Clear all authentication data
      clearAllAuthData();
      
      // Only redirect if not already on a login page and not during a login request
      if (redirectPath && !isLoginRequest) {
        // Use setTimeout to avoid navigation during error handling
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 100);
      }

      // Return a rejected promise with a clear error message
      return Promise.reject({
        ...error,
        message: status === 401
          ? 'Your session has expired. Please sign in again.'
          : 'You do not have permission to perform this action.',
        isAuthError: true
      });
    }

    // For other errors, return as-is
    return Promise.reject(error);
  }
); 