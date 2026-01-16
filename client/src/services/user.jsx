import client from './apiClient';
import { getUserData } from './dummyUsers';

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
    
    // Store user membership data from dummy data (in production, this would come from the API)
    const userData = getUserData(response.data.userName);
    if (userData) {
      localStorage.setItem('userMembership', userData.membershipType);
      localStorage.setItem('userCardNumber', userData.cardNumber);
      localStorage.setItem('userEmail', userData.email);
      localStorage.setItem('userPhoneNumber', userData.phoneNumber || '');
    }
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function loginManager(username, password) {
  try {
    const response = await client.post('/managers/login', { username, password });
    storeTokenWithExpiration(response.data.data.token);
    localStorage.setItem('managerID', JSON.stringify(response.data.id));
    localStorage.setItem('managerName', JSON.stringify(response.data.name));
    localStorage.setItem('managerUsername', JSON.stringify(response.data.username));
    return response.data;
  } catch (error) {
    console.error('Login manager failed:', error);
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
    console.error('Failed to fetch historial data:', error);  
    throw error;
  }
}

// Export utility functions for use in other components
export { isTokenExpired, clearExpiredToken, getValidToken };

