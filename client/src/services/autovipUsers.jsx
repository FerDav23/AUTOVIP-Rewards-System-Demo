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
 * Get membership details by user ID
 * @param {number|string} userId - The user ID
 * @returns {Promise<Object>} Membership object
 */
export async function getMembershipByUserId(userId) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    if (!userId) {
      return null;
    }

    const response = await client.get(`/autovip-users/membership/${userId}`);
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch membership for user ${userId}:`, error.message);
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
 * Get all cars/vehicles for a specific user
 * @param {number|string} userId - The user ID
 * @returns {Promise<Array>} Array of vehicle objects
 */
export async function getAllCarsByUserId(userId) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    if (!userId) {
      return [];
    }

    const response = await client.get(`/vehicles/user/${userId}`);
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data || [];
  } catch (error) {
    console.error(`Failed to fetch cars for user ${userId}:`, error.message);
    // Return empty array if there's an error
    return [];
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

/**
 * Update an existing AutoVIP user
 * @param {number|string} userId - The user ID
 * @param {Object} userData - User data object to update
 * @param {string} [userData.name] - User's name
 * @param {string} [userData.cardNumber] - User's card number
 * @param {string} [userData.rucCi] - User's RUC/C.I.
 * @param {number|string} [userData.membershipId] - Membership ID
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUser(userId, userData) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Prepare the request payload - only include provided fields
    const payload = {};
    if (userData.name !== undefined) payload.name = userData.name;
    if (userData.cardNumber !== undefined) payload.card_number = userData.cardNumber;
    if (userData.rucCi !== undefined) payload.ruc_ci = userData.rucCi;
    if (userData.membershipId !== undefined) payload.membership_id = userData.membershipId;

    const response = await client.put(`/autovip-users/${userId}`, payload);
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  } catch (error) {
    console.error(`Failed to update user ${userId}:`, error.message);
    throw error;
  }
}

/**
 * Delete an AutoVIP user
 * @param {number|string} userId - The user ID to delete
 * @returns {Promise<void>}
 */
export async function deleteUser(userId) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await client.delete(`/autovip-users/${userId}`);
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data;
  } catch (error) {
    console.error(`Failed to delete user ${userId}:`, error.message);
    throw error;
  }
}

/**
 * Create a new car/vehicle for a user
 * @param {number|string} userId - The user ID
 * @param {Object} vehicleData - Vehicle data object
 * @param {string} vehicleData.placa - Vehicle license plate
 * @param {string} vehicleData.marca - Vehicle brand
 * @param {string} vehicleData.modelo - Vehicle model
 * @param {number} vehicleData.año - Vehicle year
 * @param {string} vehicleData.color - Vehicle color
 * @returns {Promise<Object>} Created vehicle object
 */
export async function createCarForUser(userId, vehicleData) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Prepare the request payload
    const payload = {
      user_id: userId,
      placa: vehicleData.placa,
      marca: vehicleData.marca,
      modelo: vehicleData.modelo,
      año: vehicleData.año,
      color: vehicleData.color
    };

    const response = await client.post('/vehicles/', payload);
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  } catch (error) {
    console.error('Failed to create vehicle:', error.message);
    throw error;
  }
}

/**
 * Delete a car/vehicle by ID
 * @param {number|string} vehicleId - The vehicle ID to delete
 * @returns {Promise<void>}
 */
export async function deleteCarById(vehicleId) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    if (!vehicleId) {
      throw new Error('Vehicle ID is required');
    }

    const response = await client.delete(`/vehicles/${vehicleId}`);
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data;
  } catch (error) {
    console.error(`Failed to delete vehicle ${vehicleId}:`, error.message);
    throw error;
  }
}

/**
 * Load all transaction types from the database
 * @returns {Promise<Array>} Array of transaction type objects
 */
export async function loadTransactionTypes() {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    const response = await client.get('/transaction-types/');
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }
    return response.data.data;
  } catch (error) {
    console.error('Failed to load transaction types:', error.message);
    throw error;
  }
}

/**
 * Manage a points transaction for a user (add or remove points)
 * @param {number|string} userId - The user ID
 * @param {Object} transactionData - Transaction data object
 * @param {string} transactionData.type - Transaction type ('add' or 'remove')
 * @param {number} transactionData.amount - Amount of points to add or remove
 * @param {string} transactionData.reason - Reason/description for the transaction
 * @param {number|string} [transactionData.transactionTypeId] - Optional transaction type ID from database
 * @returns {Promise<Object>} Updated user object with new points balance
 */
export async function managePointTransaction(userId, transactionData) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!transactionData.type || !['add', 'remove'].includes(transactionData.type)) {
      throw new Error('Transaction type must be "add" or "remove"');
    }

    if (!transactionData.amount || transactionData.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    if (!transactionData.reason) {
      throw new Error('Reason is required for the transaction');
    }

    // Get manager ID from localStorage
    const managerID = localStorage.getItem('managerID');
    console.log('managerID', managerID);
    if (!managerID) {
      throw new Error('Manager ID not found. Please login again.');
    }

    // Parse manager ID (it's stored as JSON string)
    let parsedManagerId;
    try {
      parsedManagerId = JSON.parse(managerID);
    } catch (error) {
      // If parsing fails, try using it directly
      parsedManagerId = managerID;
    }

    // Prepare the request payload
    const payload = {
      type: transactionData.type,
      amount: transactionData.amount,
      reason: transactionData.reason,
      manager_id: parsedManagerId
    };

    // Add transaction type ID if provided
    if (transactionData.transactionTypeId) {
      payload.transaction_type_id = transactionData.transactionTypeId;
    }

    // Add reward ID if provided
    if (transactionData.rewardId) {
      payload.reward_id = transactionData.rewardId;
    }

    const response = await client.post(`/points-transactions/${userId}/transaction`, payload);
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  } catch (error) {
    console.error(`Failed to manage points transaction for user ${userId}:`, error.message);
    throw error;
  }
}
