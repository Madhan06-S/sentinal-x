import axios from 'axios';

const PRODUCTION_BACKEND_HOST = 'sentinel-x-nqm6.onrender.com';

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  let rawUrl = envUrl && envUrl.trim() ? envUrl.trim() : `https://${PRODUCTION_BACKEND_HOST}`;

  // Automatically rewrite frontend host or localhost references to backend host
  if (
    rawUrl.includes('sentinel-x-1.onrender.com') ||
    rawUrl.includes('localhost') ||
    rawUrl.includes('127.0.0.1')
  ) {
    rawUrl = rawUrl
      .replace('sentinel-x-1.onrender.com', PRODUCTION_BACKEND_HOST)
      .replace('http://localhost:8000', `https://${PRODUCTION_BACKEND_HOST}`)
      .replace('http://127.0.0.1:8000', `https://${PRODUCTION_BACKEND_HOST}`);
  }

  if (rawUrl.endsWith('/')) rawUrl = rawUrl.slice(0, -1);
  if (!rawUrl.endsWith('/api/v1')) {
    rawUrl = `${rawUrl}/api/v1`;
  }
  return rawUrl;
};

export const BASE_URL = getApiBaseUrl();
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.VITE_USE_MOCK_API === true;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error Interceptor]', error.response?.status, error.message);
    return Promise.reject(error);
  }
);
