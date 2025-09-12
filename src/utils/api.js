import axios from 'axios';

const isBrowser = typeof window !== 'undefined';
const isDev = isBrowser && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');

const baseURL =
  import.meta.env.VITE_API_BASE
  || (isDev ? 'https://tbs-server.onrender.com' : ''); // dev -> server, prod -> same-origin

const api = axios.create({
  baseURL,
  withCredentials: true, // send cookies (empToken) to server
});

// Only attach Authorization header if we DON'T already have the emp cookie.
// This avoids sending a stale/bad admin token that causes 403s.
api.interceptors.request.use((config) => {
  const hasEmpCookie = isBrowser && document.cookie.includes('empToken=');

  if (!hasEmpCookie) {
    let token;
    try {
      const ls = localStorage.getItem('adminUser');
      const parsed = ls ? JSON.parse(ls) : null;
      token =
        parsed?.token ||
        localStorage.getItem('adminToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('empToken');
    } catch {
      // ignore JSON parse errors
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else if (config.headers?.Authorization) {
    // rely on cookie auth; strip possibly-bad header
    delete config.headers.Authorization;
  }

  return config;
});

export default api;
