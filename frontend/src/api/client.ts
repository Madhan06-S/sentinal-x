import axios from 'axios';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return 'http://localhost:8000/api/v1';
  let url = envUrl.trim();
  if (url.endsWith('/')) url = url.slice(0, -1);
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }
  return url;
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
