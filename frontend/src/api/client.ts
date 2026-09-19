import axios from 'axios';

const PRODUCTION_BACKEND_HOST = 'sentinal-x-nqm6.onrender.com';

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    let rawUrl = envUrl.trim();
    if (
      rawUrl.includes('sentinal-x-1.onrender.com') ||
      rawUrl.includes('sentinel-x-1.onrender.com') ||
      rawUrl.includes('sentinel-x-nqm6.onrender.com')
    ) {
      rawUrl = rawUrl
        .replace('sentinal-x-1.onrender.com', PRODUCTION_BACKEND_HOST)
        .replace('sentinel-x-1.onrender.com', PRODUCTION_BACKEND_HOST)
        .replace('sentinel-x-nqm6.onrender.com', PRODUCTION_BACKEND_HOST);
    }
    if (rawUrl.endsWith('/')) rawUrl = rawUrl.slice(0, -1);
    if (!rawUrl.endsWith('/api/v1')) {
      rawUrl = `${rawUrl}/api/v1`;
    }
    return rawUrl;
  }

  // Fallback depending on browser location: if running on Render host, target Render backend. Otherwise target localhost:8000
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return `https://${PRODUCTION_BACKEND_HOST}/api/v1`;
  }
  return 'http://localhost:8000/api/v1';
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
