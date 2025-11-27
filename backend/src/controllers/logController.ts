import { Request, Response } from "express";
import {
  createLog,
  getLogsByGame,
  getLogById,
  updateLog,
  deleteLog,
} from "../models/logModel";
import {
  upsertPlatform,
  gameExists, // <--- Import this
  storeGameMetadata, // <--- Import this
} from "../models/gameModel";
import { getGameDetails } from "../services/igdbService"; // <--- Import this

// REMOVE the 'isGameInCollection' helper function entirely. We don't need it anymore.

// GET: Fetch logs for a specific game
export async function getGameLogsController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const gameId = parseInt(req.params.gameId);

    if (isNaN(gameId)) {
      return res.status(400).json({ error: "Invalid game ID" });
    }

    const logs = await getLogsByGame(userId, gameId);
    res.json(logs);
  } catch (error) {
    console.error("Get logs error:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
}

// POST: Create a new log
export async function createLogController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const {
      gameId,
      title,
      platformId,
      timePlayed,
      startDate,
      endDate,
      review,
    } = req.body;

    // Validation
    if (!gameId) return res.status(400).json({ error: "Game ID is required" });
    if (!title) return res.status(400).json({ error: "Log title is required" });

    // --- LOGIC CHANGE START ---

    // Old logic: Check isGameInCollection... (Removed)

    // New logic: Ensure game metadata exists in 'games' table
    const exists = await gameExists(gameId);

    if (!exists) {
      // Game not in local DB yet? Fetch from IGDB and store it.
      const igdbGame = await getGameDetails(gameId);
      if (!igdbGame) {
        return res.status(404).json({ error: "Game not found in IGDB" });
      }
      await storeGameMetadata(igdbGame);
    }
    // --- LOGIC CHANGE END ---

    // 2. Ensure platform exists (if provided)
    if (platformId && req.body.platformName) {
      await upsertPlatform(platformId, req.body.platformName);
    }

    // 3. Create Log
    const logId = await createLog(userId, gameId, {
      title,
      platform_id: platformId,
      time_played: timePlayed,
      start_date: startDate ? new Date(startDate) : undefined,
      end_date: endDate ? new Date(endDate) : undefined,
      review: review,
    });

    res.status(201).json({ message: "Log created successfully", logId });
  } catch (error) {
    console.error("Create log error:", error);
    res.status(500).json({ error: "Failed to create log" });
  }
}

// PUT and DELETE controllers remain exactly the same...
export async function updateLogController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const logId = parseInt(req.params.id);
    const { title, platformId, timePlayed, startDate, endDate, review } =
      req.body;

    const log = await getLogById(logId);
    if (!log) return res.status(404).json({ error: "Log not found" });
    if (log.user_id !== userId)
      return res.status(403).json({ error: "Access denied" });

    await updateLog(logId, {
      title,
      platform_id: platformId,
      time_played: timePlayed,
      start_date: startDate ? new Date(startDate) : undefined,
      end_date: endDate ? new Date(endDate) : undefined,
      review: review,
    });

    res.json({ message: "Log updated successfully" });
  } catch (error) {
    console.error("Update log error:", error);
    res.status(500).json({ error: "Failed to update log" });
  }
}

export async function deleteLogController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const logId = parseInt(req.params.id);

    const log = await getLogById(logId);
    if (!log) return res.status(404).json({ error: "Log not found" });
    if (log.user_id !== userId)
      return res.status(403).json({ error: "Access denied" });

    await deleteLog(logId);
    res.json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error("Delete log error:", error);
    res.status(500).json({ error: "Failed to delete log" });
  }
}
