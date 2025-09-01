export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const apiUrl = (endpoint) => `${API_BASE_URL}/${endpoint}`;

// Debug logging
console.log('API_BASE_URL =', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_URL =', import.meta.env.VITE_API_URL);
