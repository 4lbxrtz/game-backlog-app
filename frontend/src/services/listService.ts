import { api } from "./api";

export interface CustomList {
  id: number;
  user_id: number;
  name: string;
  description?: string;
}

export const listService = {
  // Get all lists for the current user
  async getMyLists(): Promise<CustomList[]> {
    const response = await api.get("/api/lists");
    return response.data;
  },

  // Create a new list
  async createList(name: string, description?: string) {
    const response = await api.post("/api/lists", { name, description });
    return response.data;
  },

  // Add a specific game to a specific list
  async addGameToList(listId: number, igdbId: number) {
    const response = await api.post(`/api/lists/${listId}/games`, { igdbId });
    return response.data;
  },
};
