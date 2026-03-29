import axios from 'axios';

// Get the URL from environment variables
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  // This looks for a variable in Vercel/Render, otherwise defaults to local
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Important: This allows the browser to send cookies/sessions if you use them
API.defaults.withCredentials = true;

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling for 401s
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!['/', '/login', '/register'].length > 0 && !['/', '/login', '/register'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
