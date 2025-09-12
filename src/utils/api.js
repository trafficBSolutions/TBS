import axios from 'axios';

const isBrowser = typeof window !== 'undefined';
const isDev = isBrowser && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');

// Get the current host for API calls
const getApiBaseURL = () => {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  
  if (!isBrowser) return '';
  
  // For development, use the same host but port 8000
  if (isDev) {
    return 'https://tbs-server.onrender.com';
  }
  
  // For other devices on network, use current host with port 8000
  const currentHost = location.hostname;
  if (currentHost.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/) || 
      currentHost.match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/)) {
    return `http://${currentHost}:8000`;
  }
  
  // Production - same origin
  return '';
};

const baseURL = getApiBaseURL();

const api = axios.create({
  baseURL,
  withCredentials: true, // send cookies (empToken) to server
});

// Send authentication via cookie (preferred) or header (fallback)
api.interceptors.request.use((config) => {
  const hasEmpCookie = isBrowser && document.cookie.includes('empToken=');
  
  if (hasEmpCookie) {
    console.log('API: Using empToken cookie for authentication');
    // Don't send Authorization header when cookie is available
    return config;
  }
  
  // Fallback to Authorization header if no cookie
  let token;
  try {
    token = localStorage.getItem('empToken');
    
    if (!token) {
      const ls = localStorage.getItem('adminUser');
      const parsed = ls ? JSON.parse(ls) : null;
      token =
        parsed?.token ||
        localStorage.getItem('adminToken') ||
        localStorage.getItem('token');
    }
  } catch {
    // ignore JSON parse errors
  }

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    console.log('API: Sending auth header with token:', token.slice(0, 20) + '...');
  } else {
    console.log('API: No token found in localStorage');
  }

  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - clearing stored tokens');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('empToken');
    }
    return Promise.reject(error);
  }
);

export default api;
