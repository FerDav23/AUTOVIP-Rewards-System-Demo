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

    return response.data;
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

    return response.data;
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
    return typeof response.data === 'number' ? response.data : (response.data.count || 0);
  } catch (error) {
    console.error(`Failed to fetch car count for user ${userId}:`, error.message);
    // Return 0 if there's an error (e.g., user has no cars)
    return 0;
  }
}
