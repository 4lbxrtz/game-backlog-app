import { useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: number;
  username: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar token al montar
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const userStr =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (token && userStr) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(JSON.parse(userStr));
    }

    setLoading(false);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  }

  return { user, loading, logout };
}
