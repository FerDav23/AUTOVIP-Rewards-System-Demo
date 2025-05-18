import client from './apiClient';

export async function login(username, password) {
  try {
    console.log(username, password)
    const response = await client.post('/users/login', { username, password });
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.userName));
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function logout() {
  localStorage.removeItem('authToken');
}

export async function fetchPlacas() {
  try {
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
    const response = await client.get(`/report/historial/${placa}?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch historial data:', error);  
    throw error;
  }
}

