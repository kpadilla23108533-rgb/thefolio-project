// frontend/src/api/axios.js
// This file was MISSING — it is imported by every single page in the app.
// Place this at: src/api/axios.js

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server returns 401 (token expired/invalid), log the user out
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login/register/splash
      const publicPaths = ['/', '/login', '/register'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;