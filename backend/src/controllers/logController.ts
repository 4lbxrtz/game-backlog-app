import { Request, Response } from "express";
import {
  createLog,
  getLogsByGame,
  getLogById,
  updateLog,
  deleteLog,
} from "../models/logModel";
import { upsertPlatform } from "../models/gameModel";
import pool from "../config/database";

// Helper: Check if game is in user's collection (required for Foreign Key)
async function isGameInCollection(
  userId: number,
  gameId: number
): Promise<boolean> {
  const [rows] = await pool.query<any[]>(
    "SELECT 1 FROM user_games WHERE user_id = ? AND game_id = ?",
    [userId, gameId]
  );
  return rows.length > 0;
}

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

    // 1. Verify game is in collection
    const inCollection = await isGameInCollection(userId, gameId);
    if (!inCollection) {
      return res.status(400).json({
        error: "You must add this game to your collection before adding a log.",
      });
    }

    // 2. Ensure platform exists (if provided)
    // If the frontend sends a platform name along with ID, we ensure it's in our DB
    if (platformId && req.body.platformName) {
      await upsertPlatform(platformId, req.body.platformName);
    }

    // 3. Create Log
    const logId = await createLog(userId, gameId, {
      title,
      platform_id: platformId,
      time_played: timePlayed, // Frontend sends minutes
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

// PUT: Update an existing log
export async function updateLogController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const logId = parseInt(req.params.id);
    const { title, platformId, timePlayed, startDate, endDate, review } =
      req.body;

    // 1. Check ownership
    const log = await getLogById(logId);
    if (!log) return res.status(404).json({ error: "Log not found" });
    if (log.user_id !== userId)
      return res.status(403).json({ error: "Access denied" });

    // 2. Update
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

// DELETE: Remove a log
export async function deleteLogController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const logId = parseInt(req.params.id);

    // 1. Check ownership
    const log = await getLogById(logId);
    if (!log) return res.status(404).json({ error: "Log not found" });
    if (log.user_id !== userId)
      return res.status(403).json({ error: "Access denied" });

    // 2. Delete
    await deleteLog(logId);
    res.json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error("Delete log error:", error);
    res.status(500).json({ error: "Failed to delete log" });
  }
}
