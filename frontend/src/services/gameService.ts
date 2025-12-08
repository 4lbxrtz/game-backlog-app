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
    const data = response.data;
    // Backend returns { source: 'database'|'igdb', game: {...} }
    // Normalize to return the inner game object when present
    return data && data.game ? data.game : data;
  },

  async addToCollection(gameId: number, status: string) {
    const response = await api.post("/api/games/collection", {
      igdbId: gameId,
      status,
    });
    return response.data;
  },

  async getUserGames(status?: string) {
    // Si status es null o undefined, trae todos
    const params = status ? { status } : {};
    const response = await api.get("/api/games", { params });
    return response.data;
  },

  async getStatus(gameId: number) {
    const response = await api.get(`/api/games/${gameId}/status`);
    return response.data.status;
  },

  async deleteFromCollection(gameId: number) {
    const response = await api.delete(`/api/games/${gameId}`);
    return response.data;
  },
  async getUserRating(gameId: number) {
    const response = await api.get(`/api/games/${gameId}/rating/user`);
    return response.data.rating;
  },
  async getRating(gameId: number) {
    const response = await api.get(`/api/games/${gameId}/rating`);
    // Backend returns { rating: { average, count } }
    // Normalize here to return the inner rating object so callers can use `rating.average` / `rating.count`.
    return response.data && response.data.rating ? response.data.rating : null;
  },
  async changeUserRating(gameId: number, rating: number) {
    const response = await api.put(`/api/games/${gameId}/rating/user`, {
      rating,
    });
    return response.data;
  },
  async getCountRatings(gameId: number) {
    const response = await api.get(`/api/games/${gameId}/rating/counts`);
    return response.data;
  },
};
