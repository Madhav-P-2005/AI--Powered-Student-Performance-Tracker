import axios from 'axios';

// Get the backend URL from .env, or use localhost by default
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup Interceptors for JWT Tokens
api.interceptors.request.use(
  (config) => {
    // If we have an access token, add it to the Authorization header
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// We could add a response interceptor here to handle 401s and token refresh,
// but for simplicity, we'll handle token expiration by forcing a re-login for now.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      console.error('Authentication Error', error.response.data);
      // Optional: Handle refresh logic here
    }
    return Promise.reject(error);
  }
);

export default api;
