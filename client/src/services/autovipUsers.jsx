import client from './apiClient';
import { isTokenExpired, clearExpiredToken } from './user';

/**
 * Get all AutoVIP users
 * @returns {Promise<Array>} Array of user objects
 */
export async function getAllAutoVipUsers() {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    const response = await client.get('/autovip-users/');
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch AutoVIP users:', error.message);
    throw error;
  }
}

/**
 * Get membership details by ID
 * @param {number|string} membershipId - The membership ID
 * @returns {Promise<Object>} Membership object
 */
export async function getMembershipById(membershipId) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    if (!membershipId) {
      return null;
    }

    const response = await client.get(`/memberships/${membershipId}`);
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch membership ${membershipId}:`, error.message);
    throw error;
  }
}

/**
 * Get the count of cars for a specific user
 * @param {number|string} userId - The user ID
 * @returns {Promise<number>} Number of cars for the user
 */
export async function getCarsCountByUserId(userId) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Token has expired. Please login again.');
    }

    if (!userId) {
      return 0;
    }

    const response = await client.get(`/vehicles/count/${userId}`);
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    // If the response is a number directly, return it
    // If it's an object with a count property, return that
    return typeof response.data.data === 'number' ? response.data.data : (response.data.data.count || 0);
  } catch (error) {
    console.error(`Failed to fetch car count for user ${userId}:`, error.message);
    // Return 0 if there's an error (e.g., user has no cars)
    return 0;
  }
}

/**
 * Get all memberships
 * @returns {Promise<Array>} Array of membership objects
 */
export async function getAllMemberships() {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    const response = await client.get('/memberships/');
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch memberships:', error.message);
    throw error;
  }
}

/**
 * Create a new AutoVIP user with a vehicle
 * @param {Object} userData - User data object
 * @param {string} userData.name - User's name
 * @param {string} userData.cardNumber - User's card number
 * @param {string} userData.rucCi - User's RUC/C.I.
 * @param {number|string} userData.membershipId - Membership ID
 * @param {Object} vehicleData - Vehicle data object
 * @param {string} vehicleData.placa - Vehicle license plate
 * @param {string} vehicleData.marca - Vehicle brand
 * @param {string} vehicleData.modelo - Vehicle model
 * @param {number} vehicleData.año - Vehicle year
 * @param {string} vehicleData.color - Vehicle color
 * @returns {Promise<Object>} Created user object
 */
export async function createAutoVipUser(userData, vehicleData) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    // Prepare the request payload
    const payload = {
      name: userData.name,
      card_number: userData.cardNumber,
      ruc_ci: userData.rucCi,
      membership_id: userData.membershipId,
      vehicle: {
        placa: vehicleData.placa,
        marca: vehicleData.marca,
        modelo: vehicleData.modelo,
        año: vehicleData.año,
        color: vehicleData.color
      }
    };

    const response = await client.post('/autovip-users/', payload);
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  } catch (error) {
    console.error('Failed to create AutoVIP user:', error.message);
    throw error;
  }
}
