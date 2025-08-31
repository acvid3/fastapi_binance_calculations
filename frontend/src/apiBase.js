const RAW = import.meta.env.VITE_API_URL || '/api';
export const API_BASE_URL = RAW.replace(/\/$/, '');
export const apiUrl = (p = '') => `${API_BASE_URL}/${String(p).replace(/^\//, '')}`;

// Debug logging
console.log('API_BASE_URL =', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_URL =', import.meta.env.VITE_API_URL);
