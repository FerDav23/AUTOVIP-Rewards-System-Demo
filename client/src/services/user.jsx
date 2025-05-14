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
    const response = await client.get('/vehiculos/placas');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch placas:', error);
    throw error;
  }
}

export async function fetchReport(placa, startDate = null, endDate = null) {
  try {
    const params = { placa };
    
    if (startDate) {
      params.startDate = startDate;
    }
    
    if (endDate) {
      params.endDate = endDate;
    }
    
    return client.get('/report', {
      params,
      responseType: 'blob'
    });
  } catch (error) {
    console.error('Failed to fetch report:', error);
    throw error;
  }
}
