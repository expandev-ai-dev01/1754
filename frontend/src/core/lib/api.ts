import axios, { type AxiosInstance } from 'axios';

export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_URL,
  version: import.meta.env.VITE_API_VERSION,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT, 10),

  get externalUrl(): string {
    return `${this.baseUrl}/api/${this.version}/external`;
  },

  get internalUrl(): string {
    return `${this.baseUrl}/api/${this.version}/internal`;
  },
};

export const publicClient: AxiosInstance = axios.create({
  baseURL: apiConfig.externalUrl,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authenticatedClient: AxiosInstance = axios.create({
  baseURL: apiConfig.internalUrl,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

authenticatedClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

authenticatedClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
