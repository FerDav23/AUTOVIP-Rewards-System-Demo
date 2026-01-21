import client from './apiClient';
import { isTokenExpired, clearExpiredToken } from './user';

/**
 * Get all reward types
 * @returns {Promise<Array>} Array of reward type objects
 */
export async function getRewardTypes() {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    const response = await client.get('/reward-types/');
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch reward types:', error.message);
    throw error;
  }
}

/**
 * Get all rewards
 * @returns {Promise<Array>} Array of reward objects
 */
export async function getAllRewards() {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    const response = await client.get('/rewards/');
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch rewards:', error.message);
    throw error;
  }
}

/**
 * Create a new reward
 * @param {Object} rewardData - Reward data object
 * @param {string} rewardData.title - Reward title
 * @param {string} rewardData.description - Reward description
 * @param {number} rewardData.pointsRequired - Points required to redeem
 * @param {number} rewardData.categoryId - Reward category/type ID
 * @param {Array<number>} rewardData.memberships - Array of membership IDs that can see this reward
 * @param {string} rewardData.imageUrl - Image URL for the reward
 * @param {boolean} [rewardData.available=true] - Whether the reward is available
 * @returns {Promise<Object>} Created reward object
 */
export async function createReward(rewardData) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    // Prepare the request payload
    const payload = {
      title: rewardData.title,
      description: rewardData.description,
      points_required: rewardData.pointsRequired,
      category_id: rewardData.categoryId,
      memberships: rewardData.memberships,
      image_url: rewardData.imageUrl,
      available: rewardData.available !== undefined ? rewardData.available : true
    };

    const response = await client.post('/rewards/', payload);
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  } catch (error) {
    console.error('Failed to create reward:', error.message);
    throw error;
  }
}

/**
 * Update an existing reward
 * @param {number|string} rewardId - The reward ID
 * @param {Object} rewardData - Reward data object to update
 * @param {string} [rewardData.title] - Reward title
 * @param {string} [rewardData.description] - Reward description
 * @param {number} [rewardData.pointsRequired] - Points required to redeem
 * @param {number} [rewardData.categoryId] - Reward category/type ID
 * @param {Array<number>} [rewardData.memberships] - Array of membership IDs that can see this reward
 * @param {string} [rewardData.imageUrl] - Image URL for the reward
 * @param {boolean} [rewardData.available] - Whether the reward is available
 * @returns {Promise<Object>} Updated reward object
 */
export async function updateReward(rewardId, rewardData) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    if (!rewardId) {
      throw new Error('Reward ID is required');
    }

    // Prepare the request payload - only include provided fields
    const payload = {};
    if (rewardData.title !== undefined) payload.title = rewardData.title;
    if (rewardData.description !== undefined) payload.description = rewardData.description;
    if (rewardData.pointsRequired !== undefined) payload.points_required = rewardData.pointsRequired;
    if (rewardData.category !== undefined) payload.category = rewardData.category;
    if (rewardData.memberships !== undefined) payload.memberships = rewardData.memberships;
    if (rewardData.imageUrl !== undefined) payload.image_url = rewardData.imageUrl;
    if (rewardData.available !== undefined) payload.available = rewardData.available;

    const response = await client.put(`/rewards/${rewardId}`, payload);
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  } catch (error) {
    console.error(`Failed to update reward ${rewardId}:`, error.message);
    throw error;
  }
}

/**
 * Delete a reward
 * @param {number|string} rewardId - The reward ID to delete
 * @returns {Promise<void>}
 */
export async function deleteReward(rewardId) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    if (!rewardId) {
      throw new Error('Reward ID is required');
    }

    const response = await client.delete(`/rewards/${rewardId}`);
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data;
  } catch (error) {
    console.error(`Failed to delete reward ${rewardId}:`, error.message);
    throw error;
  }
}
