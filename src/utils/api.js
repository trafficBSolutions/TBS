// src/utils/api.js
import axios from 'axios';

const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const baseURL =
  import.meta.env.VITE_API_BASE
  || (isDev ? 'https://tbs-server.onrender.com' : ''); // dev -> server, prod -> same-origin or env

const api = axios.create({
  baseURL,
  withCredentials: true,
});

  const hasEmpCookie = typeof document !== 'undefined' && document.cookie.includes('empToken=');
  if (!hasEmpCookie) {
    const ls = localStorage.getItem('adminUser');
    const fromUser = ls ? (() => { try { return JSON.parse(ls)?.token; } catch { return null; } })() : null;
    const token = fromUser || localStorage.getItem('adminToken') || localStorage.getItem('token') || localStorage.getItem('empToken');
    if (token) (config.headers ||= {}).Authorization = `Bearer ${token}`;
  } else {
    // rely on cookie auth; avoid sending a possibly-bad header
    if (config.headers && 'Authorization' in config.headers) {
      delete config.headers.Authorization;
   }
  }
export default api;
