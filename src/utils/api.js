// src/utils/api.js
import axios from 'axios';

const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const baseURL =
  import.meta.env.VITE_API_BASE
  || (isDev ? 'http://localhost:8000' : 'https://tbs-server.onrender.com');

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const ls = localStorage.getItem('adminUser');
  const fromUser = ls ? (() => { try { return JSON.parse(ls)?.token; } catch { return null; } })() : null;
  const token = fromUser || localStorage.getItem('adminToken') || localStorage.getItem('token');
  if (token) (config.headers ||= {}).Authorization = `Bearer ${token}`;
  return config;
});

export default api;
