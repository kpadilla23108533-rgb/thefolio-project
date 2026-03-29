import axios from 'axios';

/**
 * 1. DYNAMIC BASE URL
 * In Vercel, it will use REACT_APP_API_URL from your environment variables.
 * Locally, it defaults to localhost:5000.
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_URL,
});

// 2. ATTACH JWT TOKEN
// Automatically adds the Bearer token to every outgoing request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 3. GLOBAL RESPONSE HANDLING
// Handles token expiration (401) and common API errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401 (Unauthorized), the token is likely expired
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Clean up user data too
      
      const publicPaths = ['/', '/login', '/register'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;