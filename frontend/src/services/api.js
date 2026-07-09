import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor (e.g., for auth tokens and dynamic API endpoints)
api.interceptors.request.use(
  (config) => {
    config.baseURL = localStorage.getItem('dora_api_url') || import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('dora_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to unwrap standard success envelopes
api.interceptors.response.use(
  (response) => {
    // Prevent crashing if the API returns an HTML page (e.g., due to SPA fallback when API URL is misconfigured)
    if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
      return Promise.reject(new Error('API returned HTML instead of JSON. Ensure VITE_API_URL is correctly configured.'));
    }

    if (response.data && response.data.success === true && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const payload = error.response?.data;
    if (payload?.message) {
      return Promise.reject({
        ...payload,
        message: payload.message,
        status: error.response?.status
      });
    }
    return Promise.reject(error);
  }
);

export default api;
