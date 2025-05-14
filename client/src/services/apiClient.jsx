import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create an axios instance
const client = axios.create({
  baseURL: API_URL
});

export default client;

// Add request interceptor to include auth token
client.interceptors.request.use(
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