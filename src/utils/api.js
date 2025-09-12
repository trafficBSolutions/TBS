import axios from 'axios';

const isBrowser = typeof window !== 'undefined';
const isDev = isBrowser && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');

// Use remote server for all requests
const getApiBaseURL = () => {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  
  // Always use remote server
  return 'https://tbs-server.onrender.com';
};

const baseURL = getApiBaseURL();

const api = axios.create({
  baseURL,
  withCredentials: true, // send cookies (empToken) to server
});

// Always send token via Authorization header for cross-device compatibility
api.interceptors.request.use((config) => {
  let token;
  
  // Try to get token from localStorage first
  try {
    token = localStorage.getItem('empToken');
    
    if (!token) {
      const ls = localStorage.getItem('adminUser');
      const parsed = ls ? JSON.parse(ls) : null;
      token = parsed?.token || localStorage.getItem('adminToken') || localStorage.getItem('token');
    }
  } catch {
    // ignore JSON parse errors
  }

  // Always send Authorization header if we have a token
  if (token && token !== 'fake-token-for-dev') {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    console.log('API: Sending auth header');
  } else {
    console.log('API: No valid token found');
  }

  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - but continuing for development');
      // Don't clear tokens or redirect for now
    }
    return Promise.reject(error);
  }
);

export default api;
