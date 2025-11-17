import { api } from "./api";

export const gameService = {
  async search(query: string) {
    const response = await api.get("/api/games/search", {
      params: { q: query },
    });
    return response.data;
  },

  async getById(gameId: number) {
    const response = await api.get(`/api/games/${gameId}`);
    return response.data;
  },

  async addToCollection(gameId: number, status: string) {
    const response = await api.post("/api/games/collection", {
      igdbId: gameId,
      status,
    });
    return response.data;
  },

  async getUserGames(status?: string) {
    const params = status ? { status } : {};
    const response = await api.get("/api/user-games", { params });
    return response.data;
  },

  async updateStatus(gameId: number, status: string) {
    const response = await api.put(`/api/user-games/${gameId}/status`, {
      status,
    });
    return response.data;
  },

  async rate(gameId: number, rating: number) {
    const response = await api.put(`/api/user-games/${gameId}/rating`, {
      rating,
    });
    return response.data;
  },
};
