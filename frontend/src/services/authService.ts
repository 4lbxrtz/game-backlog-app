import { api } from "./api";

export const authService = {
  async register(username: string, email: string, password: string) {
    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  },

  async getDashboard() {
    const response = await api.get("/api/auth/dashboard");
    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  },
};
