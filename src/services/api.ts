import axios from 'axios';

// Use the environment variable with a fallback
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API URL being used:', API_URL);

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  },
  withCredentials: false
});

// Add a request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message || error);
    return Promise.reject(error);
  }
);

export default api; 