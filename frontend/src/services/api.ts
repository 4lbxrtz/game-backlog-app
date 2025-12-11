import axios from "axios";

const IP_BACKEND = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: IP_BACKEND,
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR: Attaches token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Handles 401 (Token Expired/Invalid) automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid/expired. Clear storage to prevent loops.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optional: Force reload to kick user to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
