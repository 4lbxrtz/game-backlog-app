import { api } from "./api";

const API_BASE_URL =
  import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

export const authService = {
  async register(username: string, email: string, password: string) {
    const response = await api.post(`${API_BASE_URL}/api/auth/register`, {
      username,
      email,
      password,
    });
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post(`${API_BASE_URL}/api/auth/login`, { email, password });
    return response.data;
  },
  
  async getDashboard() {
    const response = await api.get(`${API_BASE_URL}/api/auth/dashboard`);
    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  },
};
