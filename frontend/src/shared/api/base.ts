import axios from "axios";
import { API_BASE_URL } from "../config/env";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (err) => {
    const message = err.response?.data?.detail || err.message || "404";
    console.error("API Error:", message);
    return Promise.reject(err);
  },
);
