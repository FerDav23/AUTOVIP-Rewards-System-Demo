import client from './apiClient';

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
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('tokenExpiration');
  localStorage.removeItem('user');
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

