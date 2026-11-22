import { API_BASE_URL } from './Api/endpoints';
import axios from 'axios';

// Create an Axios instance
const instance = axios.create({
  // Live Base URLs:
  // baseURL: 'https://api.nowaybroker.com',
  // baseURL: 'https://api.truloapp.com/',
  
  // Local Base URL:
  baseURL: API_BASE_URL,
  timeout: 5000, // Timeout after 5 seconds
  headers: {
    'Content-Type': 'application/json', // Default content type
    // 'Authorization' header will be set dynamically in the interceptor
  },
});
instance.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

const csrfToken = document.cookie.match(/csrftoken=([\w-]+)/)?.[1] || '';
instance.defaults.headers.common['X-CSRFToken'] = csrfToken;

// Add a request interceptor to include the Authorization token if present
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default instance;

