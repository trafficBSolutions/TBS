import axios from 'axios';

const isBrowser = typeof window !== 'undefined';
const isDev = isBrowser && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');

const baseURL =
  import.meta.env.VITE_API_BASE
  || (isDev ? 'https://tbs-server.onrender.com' : ''); // dev -> local server, prod -> same-origin

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

