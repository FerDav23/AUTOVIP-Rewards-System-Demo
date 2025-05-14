import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create an axios instance
const api = axios.create({
  baseURL: API_URL
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function login(username, password) {
  const response = await api.post('/auth/login', { username, password });
  localStorage.setItem('authToken', response.data.token);
  return response.data;
}

export async function logout() {
  localStorage.removeItem('authToken');
}

export async function fetchPlacas() {
  const response = await api.get('/vehiculos/placas');
  return response.data;
}

export async function fetchReport(placa, startDate = null, endDate = null) {
  const params = { placa };
  
  if (startDate) {
    params.startDate = startDate;
  }
  
  if (endDate) {
    params.endDate = endDate;
  }
  
  return api.get('/report', {
    params,
    responseType: 'blob'
  });
}
