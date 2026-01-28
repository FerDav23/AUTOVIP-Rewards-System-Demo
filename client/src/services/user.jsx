import client from './apiClient';
import logger from '../utils/logger';

// Token expiration time in milliseconds (24 hours)
const TOKEN_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

// Store token with expiration timestamp
function storeTokenWithExpiration(token) {
  const expirationTime = Date.now() + TOKEN_EXPIRATION_TIME;
  localStorage.setItem('authToken', token);
  localStorage.setItem('tokenExpiration', expirationTime.toString());
}

// Check if token is expired
function isTokenExpired() {
  const expirationTime = localStorage.getItem('tokenExpiration');
  if (!expirationTime) return true;
  
  return Date.now() > parseInt(expirationTime);
}

// Clear expired token
function clearExpiredToken() {
  if (isTokenExpired()) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('user');
    return true;
  }
  return false;
}

// Get valid token or null if expired
function getValidToken() {
  if (isTokenExpired()) {
    clearExpiredToken();
    return null;
  }
  return localStorage.getItem('authToken');
}

export async function login(username, password) {
  try {
    const response = await client.post('/users/login', { username, password });
    storeTokenWithExpiration(response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.userName));
    localStorage.setItem('password', JSON.stringify(response.data.password));
    
    // Only use dummy data in development mode
    // In production, user data should come from the API response
    if (import.meta.env.DEV) {
      // Lazy load dummy data helper function
      const dummyUsersModule = await import('./dummyUsers').catch(() => null);
      if (dummyUsersModule?.getUserData) {
        const userData = dummyUsersModule.getUserData(response.data.userName);
        if (userData) {
          localStorage.setItem('userMembership', userData.membershipType);
          localStorage.setItem('userCardNumber', userData.cardNumber);
          localStorage.setItem('userEmail', userData.email);
          localStorage.setItem('userPhoneNumber', userData.phoneNumber || '');
        }
      }
    }
    // TODO: In production, extract user data from API response instead of dummy data
    // Example: if (response.data.user) { ... }
    
    return response.data;
  } catch (error) {
    logger.logAuthError(error, { context: 'User login' });
    throw error;
  }
}

export async function loginManager(username, password) {
  try {
    const response = await client.post('/managers/login', { username, password });
    storeTokenWithExpiration(response.data.data.token);
    localStorage.setItem('managerID', JSON.stringify(response.data.data.id));
    localStorage.setItem('managerName', JSON.stringify(response.data.data.name));
    localStorage.setItem('managerUsername', JSON.stringify(response.data.data.username));
    return response.data.data;
  } catch (error) {
    logger.logAuthError(error, { context: 'Manager login' });
    throw error;
  }
}

export async function loginAutovipUser (username, password) {
  try {
    const response = await client.post('/autovip-users/login', { username, password });
    storeTokenWithExpiration(response.data.data.token);
    localStorage.setItem('autovipUserID', JSON.stringify(response.data.data.id));
    localStorage.setItem('autovipUserName', JSON.stringify(response.data.data.name));
    localStorage.setItem('autovipUserCardNumber', JSON.stringify(response.data.data.card_number));
    localStorage.setItem('autovipUserRucCi', JSON.stringify(response.data.data.ruc_ci));
    return response.data.data;
  } catch (error) {
    logger.logAuthError(error, { context: 'AutoVIP user login' });
    throw error;
  }
}


export async function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('tokenExpiration');
  localStorage.removeItem('user');
  localStorage.removeItem('userMembership');
  localStorage.removeItem('userCardNumber');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userPhoneNumber');
}

export async function logoutManager() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('tokenExpiration');
  localStorage.removeItem('managerID');
  localStorage.removeItem('managerName');
  localStorage.removeItem('managerUsername');
}

export async function logoutAutovipUser() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('tokenExpiration');
  localStorage.removeItem('autovipUserID');
  localStorage.removeItem('autovipUserName');
  localStorage.removeItem('autovipUserCardNumber');
  localStorage.removeItem('autovipUserRucCi');
}

/**
 * Get current user's membership type
 * @returns {string|null} Membership type or null
 */
export function getCurrentUserMembership() {
  return localStorage.getItem('userMembership');
}

/**
 * Get current user's card number
 * @returns {string|null} Card number or null
 */
export function getCurrentUserCardNumber() {
  return localStorage.getItem('userCardNumber');
}

/**
 * Get current user's email
 * @returns {string|null} Email or null
 */
export function getCurrentUserEmail() {
  return localStorage.getItem('userEmail');
}

/**
 * Get current user's phone number
 * @returns {string|null} Phone number or null
 */
export function getCurrentUserPhoneNumber() {
  return localStorage.getItem('userPhoneNumber');
}

export async function fetchPlacas() {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Token has expired. Please login again.');
    }

    const user = localStorage.getItem('user');
    
    if (!user) {
      throw new Error('No user found in localStorage. Please login again.');
    }

    const response = await client.get(`/report/placas/${encodeURIComponent(user)}`);
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data;
  } catch (error) {
    console.error('Failed to fetch placas:', error.message);
    throw error;
  }
}

export async function getHistorialData(placa, startDate, endDate) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Token has expired. Please login again.');
    }

    const response = await client.get(`/report/historial/${placa}?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    logger.logApiError(error, { context: 'Fetch historial data' });
    throw error;
  }
}

/**
 * Verify if the current token is still valid by making an API call
 * @returns {Promise<void>} Resolves if token is valid, rejects if invalid
 */
export async function verifyToken() {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Token has expired. Please login again.');
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No token found. Please login again.');
    }

    // Make a request to verify the token
    // Using a common verification endpoint pattern
    // Adjust the endpoint if your API uses a different path
    await client.get('/users/verify');
  } catch (error) {
    // If verification fails, clear the token
    clearExpiredToken();
    throw error;
  }
}

// Export utility functions for use in other components
export { isTokenExpired, clearExpiredToken, getValidToken };

