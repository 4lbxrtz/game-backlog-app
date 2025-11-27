import { api } from "./api";

export interface Log {
  id: number;
  title: string;
  game_id: number;
  platform_id?: number;
  platform_name?: string; // Comes from the backend JOIN
  time_played?: number; // Stored in minutes
  start_date?: string;
  end_date?: string;
  review?: string;
  created_at?: string;
}

export const logService = {
  // Get all logs for a specific game
  async getByGameId(gameId: number): Promise<Log[]> {
    const response = await api.get(`/api/logs/game/${gameId}`);
    return response.data;
  },

  // Create a new log
  async create(data: {
    gameId: number;
    title: string;
    platformId?: number;
    platformName?: string; // For syncing if needed
    timePlayed?: number; // Send in minutes
    startDate?: string;
    endDate?: string;
    review?: string;
  }) {
    const response = await api.post("/api/logs", data);
    return response.data;
  },
  async update(logId: number, data: any) {
    const response = await api.put(`/api/logs/${logId}`, data);
    return response.data;
  },
  // Delete a log
  async delete(logId: number) {
    const response = await api.delete(`/api/logs/${logId}`);
    return response.data;
  },
};
