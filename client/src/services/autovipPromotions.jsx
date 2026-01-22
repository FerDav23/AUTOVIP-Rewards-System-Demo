import client from './apiClient';
import { isTokenExpired, clearExpiredToken } from './user';

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
    console.log('promotionData', promotionData);
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
    console.error('Failed to create promotion:', error.message);
    throw error;
  }
}
