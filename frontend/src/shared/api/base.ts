import axios from 'axios';
import { API_BASE_URL } from '../config/env';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standard error logging
    const message = error.response?.data?.detail || error.message || 'Ошибка сети';
    console.error('[API Error]:', message);
    return Promise.reject(error);
  }
);
