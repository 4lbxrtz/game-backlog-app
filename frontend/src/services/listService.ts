import { api } from "./api";

export interface ListGame {
  id: number;
  title: string;
  cover_url?: string;
  status?: string; // 'Completed', 'Playing', etc.
  personal_rating?: number;
  release_date?: string;
}

export interface CustomList {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  game_count?: number;
  covers?: string[];
  games?: ListGame[]; // <--- Add this
  updated_at?: string;
}

export const listService = {
  // Get all lists for the current user
  async getMyLists(): Promise<CustomList[]> {
    const response = await api.get("/api/list");
    return response.data;
  },
  async getListById(listId: number): Promise<CustomList> {
    const response = await api.get(`/api/list/${listId}`);
    return response.data;
  },

  // Create a new list
  async createList(name: string, description?: string) {
    const response = await api.post("/api/list", { name, description });
    return response.data;
  },

  // Add a specific game to a specific list
  async addGameToList(listId: number, igdbId: number) {
    const response = await api.post(`/api/list/${listId}/game`, { igdbId });
    return response.data;
  },

  async updateList(listId: number, name: string, description: string) {
    const response = await api.put(`/api/list/${listId}`, {
      name,
      description,
    });
    return response.data;
  },

  // NUEVO: Eliminar juego de lista
  async removeGameFromList(listId: number, gameId: number) {
    const response = await api.delete(`/api/list/${listId}/game/${gameId}`);
    return response.data;
  },

  // (Opcional) Si quieres borrar la lista entera también
  async deleteList(listId: number) {
    const response = await api.delete(`/api/list/${listId}`);
    return response.data;
  },
};
