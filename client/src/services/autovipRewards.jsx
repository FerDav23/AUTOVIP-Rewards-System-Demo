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

    const response = await client.get('/rewards-memberships/');
    
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
 * @param {File} [rewardData.imageFile] - Image file to upload (will be sent in FormData)
 * @param {string} [rewardData.imageUrl] - Image URL for the reward (if file is not provided)
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
    // If image file is provided, use FormData; otherwise use JSON
    if (rewardData.imageFile) {
      const formData = new FormData();
      formData.append('title', rewardData.title);
      formData.append('description', rewardData.description);
      formData.append('points_required', rewardData.pointsRequired);
      formData.append('category_id', rewardData.categoryId);
      formData.append('available', rewardData.available !== undefined ? rewardData.available : true);
      // Append memberships array
      if (rewardData.memberships && Array.isArray(rewardData.memberships)) {
        rewardData.memberships.forEach((membershipId, index) => {
          formData.append(`memberships[${index}]`, membershipId);
        });
      }
      
      // Append image file
      formData.append('image', rewardData.imageFile);
      

      const response = await client.post('/rewards/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.data) {
        throw new Error('Invalid response format from server');
      }

      return response.data.data;
    } else {
      // Fallback to JSON if no file (for backward compatibility)
      const payload = {
        title: rewardData.title,
        description: rewardData.description,
        points_required: rewardData.pointsRequired,
        category_id: rewardData.categoryId,
        memberships: rewardData.memberships,
        image_url: rewardData.imageUrl || '',
        available: rewardData.available !== undefined ? rewardData.available : true
      };

      const response = await client.post('/rewards/', payload);
      
      if (!response.data) {
        throw new Error('Invalid response format from server');
      }

      return response.data.data;
    }
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
 * @param {File} [rewardData.imageFile] - Image file to upload (will be sent in FormData)
 * @param {string} [rewardData.imageUrl] - Image URL for the reward (if file is not provided)
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

    // If image file is provided, use FormData; otherwise use JSON
    if (rewardData.imageFile) {
      const formData = new FormData();
      
      // Only append fields that are provided
      if (rewardData.title !== undefined) formData.append('title', rewardData.title);
      if (rewardData.description !== undefined) formData.append('description', rewardData.description);
      if (rewardData.pointsRequired !== undefined) formData.append('points_required', rewardData.pointsRequired);
      if (rewardData.categoryId !== undefined) formData.append('category_id', rewardData.categoryId);
      if (rewardData.available !== undefined) formData.append('available', rewardData.available);
      
      // Append memberships array if provided
      if (rewardData.memberships !== undefined && Array.isArray(rewardData.memberships)) {
        rewardData.memberships.forEach((membershipId, index) => {
          formData.append(`memberships[${index}]`, membershipId);
        });
      }
      
      // Append image file
      formData.append('image', rewardData.imageFile);

      const response = await client.put(`/rewards/${rewardId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.data) {
        throw new Error('Invalid response format from server');
      }

      return response.data.data;
    } else {
      // Fallback to JSON if no file
      const payload = {};
      if (rewardData.title !== undefined) payload.title = rewardData.title;
      if (rewardData.description !== undefined) payload.description = rewardData.description;
      if (rewardData.pointsRequired !== undefined) payload.points_required = rewardData.pointsRequired;
      if (rewardData.categoryId !== undefined) payload.category_id = rewardData.categoryId;
      if (rewardData.memberships !== undefined) payload.memberships = rewardData.memberships;
      if (rewardData.imageUrl !== undefined) payload.image_url = rewardData.imageUrl;
      if (rewardData.available !== undefined) payload.available = rewardData.available;

      const response = await client.put(`/rewards/${rewardId}`, payload);
      
      if (!response.data) {
        throw new Error('Invalid response format from server');
      }

      return response.data.data;
    }
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

/**
 * Upload an image to S3 via the backend
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The S3 URL of the uploaded image
 */
export async function uploadImage(file) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    if (!file) {
      throw new Error('File is required');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // Create FormData to send the file
    const formData = new FormData();
    formData.append('image', file);

    const response = await client.post('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.data || !response.data.data || !response.data.data.imageUrl) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data.imageUrl;
  } catch (error) {
    console.error('Failed to upload image:', error.message);
    throw error;
  }
}
