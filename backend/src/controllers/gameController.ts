import { Request, Response } from "express";
import { getGameDetails, searchIGDB } from "../services/igdbService";
import { searchGamesInDatabase } from "../models/gameModel";
import {
  gameExists,
  storeGameMetadata,
  getGameById,
} from "../models/gameModel";

// Search games from IGDB (no database storage yet)
export async function searchGamesController(req: Request, res: Response) {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length < 2) {
      return res
        .status(400)
        .json({ error: "Search query required (min 2 characters)" });
    }

    // 1. Search in database first
    const dbGames = await searchGamesInDatabase(query);

    if (dbGames.length > 0) {
      // Found in database - return immediately
      console.log(dbGames);
      return res.json(dbGames);
    }

    // 2. Not found in database - search IGDB
    const igdbGames = await searchIGDB(query);

    return res.json({
      source: "igdb",
      games: igdbGames,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Failed to search games" });
  }
}

// Get game details (from database if exists, otherwise from IGDB)
export async function getGameController(req: Request, res: Response) {
  try {
    const igdbId = parseInt(req.params.id);

    // Check if we already have this game
    const exists = await gameExists(igdbId);

    if (exists) {
      // Get from database (fast!)
      const game = await getGameById(igdbId);
      return res.json({ source: "database", game });
    }

    // Not in database, fetch from IGDB
    const igdbGame = await getGameDetails(igdbId);

    if (!igdbGame) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Store it for future use
    await storeGameMetadata(igdbGame);

    // Get the stored game (with proper formatting)
    const game = await getGameById(igdbId);

    res.json({ source: "igdb", game });
  } catch (error) {
    console.error("Get game error:", error);
    res.status(500).json({ error: "Failed to get game details" });
  }
}

/**
// Add game to user's collection
export async function addGameToCollectionController(req: Request, res: Response) {
  try {
    const userId = req.user.id; // From auth middleware (we'll add this later)
    const { igdbId, status } = req.body;
    
    // Ensure game metadata is in database
    const exists = await gameExists(igdbId);
    
    if (!exists) {
      // Fetch and store game metadata first
      const igdbGame = await getGameDetails(igdbId);
      await storeGameMetadata(igdbGame);
    }
    
    // Add to user's collection
    await pool.query(
      `INSERT INTO user_games (user_id, game_id, status)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [userId, igdbId, status || 'Backlog']
    );
    
    res.json({ message: 'Game added to collection' });
    
  } catch (error) {
    console.error('Add game error:', error);
    res.status(500).json({ error: 'Failed to add game to collection' });
  }
}
  */
