import client from './apiClient';
import { isTokenExpired, clearExpiredToken } from './user';
import * as mockData from './mock/mockData';

const isDemoMode = () => import.meta.env.VITE_DEMO_MODE === 'true';

/**
 * Load birthday messages for AutoVIP users.
 * @returns {Promise<Array<{ user_id: number|string, user_name: string, birthday: string, url: string }>>} Array of birthday message objects
 */
export async function loadBirthdayMessages() {
  if (isDemoMode()) return mockData.birthdayMessageLogs;
  try {
    if (isTokenExpired()) {
      clearExpiredToken();
      throw new Error('Session has expired. Please login again.');
    }

    const response = await client.get('/birthday-message-logs');

    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    const data = response.data.data;
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item) => ({
      user_id: item.user_id,
      user_name: item.user_name ?? item.userName ?? '',
      birthday: item.birthday ?? '',
      url: item.url ?? ''
    }));
  } catch (error) {
    console.error('loadBirthdayMessages error:', error?.response?.data ?? error.message);
    throw error?.response?.data?.message ?? error.message ?? new Error('Error loading birthday messages.');
  }
}
