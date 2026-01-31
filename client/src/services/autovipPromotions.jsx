import client from './apiClient';
import { isTokenExpired, clearExpiredToken } from './user';

/**
 * Get all promotions
 * @returns {Promise<Array>} Array of promotion objects
 */
export async function getAllPromotions() {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    const response = await client.get('/promotions/');
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data.data;
  } catch (error) {
    console.error(error.response.data.message);
    throw error.response.data.message;
  }
}

/**
 * Create a new promotion
 * @param {Object} promotionData - Promotion data object
 * @param {string} promotionData.title - Promotion title
 * @param {string} promotionData.description - Promotion description
 * @param {string} promotionData.validUntil - Valid until date (YYYY-MM-DD format)
 * @param {File} [promotionData.imageFile] - Image file to upload (will be sent in FormData)
 * @param {string} [promotionData.imageUrl] - Image URL for the promotion (if file is not provided)
 * @returns {Promise<Object>} Created promotion object
 */
export async function createPromotion(promotionData) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }
    // If image file is provided, use FormData; otherwise use JSON
    if (promotionData.imageFile) {
      const formData = new FormData();
      formData.append('title', promotionData.title);
      formData.append('description', promotionData.description);
      formData.append('valid_until', promotionData.validUntil);
      
      // Append image file
      formData.append('image', promotionData.imageFile);

      const response = await client.post('/promotions/', formData, {
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
        title: promotionData.title,
        description: promotionData.description,
        valid_until: promotionData.validUntil,
        image_url: promotionData.imageUrl || '',
      };

      const response = await client.post('/promotions/', payload);
      
      if (!response.data) {
        throw new Error('Invalid response format from server');
      }

      return response.data.data;
    }
  } catch (error) {
    console.error(error.response.data.message);
    throw error.response.data.message;
  }
}

/**
 * Update an existing promotion
 * @param {number|string} promotionId - The promotion ID
 * @param {Object} promotionData - Promotion data object to update
 * @param {string} [promotionData.title] - Promotion title
 * @param {string} [promotionData.description] - Promotion description
 * @param {string} [promotionData.validUntil] - Valid until date (YYYY-MM-DD format)
 * @param {File} [promotionData.imageFile] - Image file to upload (will be sent in FormData)
 * @param {string} [promotionData.imageUrl] - Image URL for the promotion (if file is not provided)
 * @returns {Promise<Object>} Updated promotion object
 */
export async function updatePromotion(promotionId, promotionData) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    if (!promotionId) {
      throw new Error('Promotion ID is required');
    }

    // If image file is provided, use FormData; otherwise use JSON
    if (promotionData.imageFile) {
      const formData = new FormData();
      
      // Only append fields that are provided
      if (promotionData.title !== undefined) formData.append('title', promotionData.title);
      if (promotionData.description !== undefined) formData.append('description', promotionData.description);
      if (promotionData.validUntil !== undefined) formData.append('valid_until', promotionData.validUntil);
      
      // Append image file
      formData.append('image', promotionData.imageFile);

      const response = await client.put(`/promotions/${promotionId}`, formData, {
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
      if (promotionData.title !== undefined) payload.title = promotionData.title;
      if (promotionData.description !== undefined) payload.description = promotionData.description;
      if (promotionData.validUntil !== undefined) payload.valid_until = promotionData.validUntil;
      if (promotionData.imageUrl !== undefined) payload.image_url = promotionData.imageUrl;

      const response = await client.put(`/promotions/${promotionId}`, payload);
      
      if (!response.data) {
        throw new Error('Invalid response format from server');
      }

      return response.data.data;
    }
  } catch (error) {
    console.error(error.response.data.message);
    throw error.response.data.message;
  }
}

/**
 * Delete a promotion
 * @param {number|string} promotionId - The promotion ID to delete
 * @returns {Promise<void>}
 */
export async function deletePromotion(promotionId) {
  try {
    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    if (!promotionId) {
      throw new Error('Promotion ID is required');
    }

    const response = await client.delete(`/promotions/${promotionId}`);
    
    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return response.data;
  } catch (error) {
    console.error(error.response.data.message);
    throw error.response.data.message;
  }
}
