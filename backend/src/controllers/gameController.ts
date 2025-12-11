import { Request, Response } from "express";
import { getGameDetails, searchIGDB } from "../services/igdbService";
import { getCountRatings, getTrendingGamesFromDB, searchGamesInDatabase } from "../models/gameModel";
import {
  gameExists,
  storeGameMetadata,
  getGameById,
  getUserRating,
  getRating,
  updateUserRating,
} from "../models/gameModel";
import {
  getUserGameStatus,
  insertGameIntoCollection,
  updateGameStatus,
  removeGameFromCollection,
  getUserGamesByStatus,
  getUserProfileStats,
} from "../models/userModel";

// Search games from IGDB (no database storage yet)
export async function searchGamesController(req: Request, res: Response) {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length < 0) {
      return res
        .status(400)
        .json({ error: "Search query required" });
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

export async function getCountRatingsController(req: Request, res: Response) {
  try {
    const gameId = parseInt(req.params.gameId);

    if (isNaN(gameId)) {
      return res.status(400).json({ error: "Invalid game ID" });
    }

    const counts = await getCountRatings(gameId);

    // Return the counts (or null if not found)
    res.json({ counts: counts || null });
  } catch (error) {
    console.error("Get count ratings error:", error);
    res.status(500).json({ error: "Failed to get count ratings" });
  }
}

// Add game to user's collection
export async function addGameToCollectionController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user!.userId;
    const { igdbId, status } = req.body;

    // Ensure game metadata is in database
    const exists = await gameExists(igdbId);

    if (!exists) {
      // Fetch and store game metadata first
      const igdbGame = await getGameDetails(igdbId);
      if (!igdbGame) {
        return res.status(404).json({ error: "Game not found in IGDB" });
      }
      await storeGameMetadata(igdbGame);
    }

    if (!status) {
      return res
        .status(400)
        .json({ error: "Status is required to add game to collection" });
    }

    if (!igdbId) {
      return res
        .status(400)
        .json({ error: "igdbId is required to add game to collection" });
    }

    const validStatuses = [
      "Playing",
      "Completed",
      "Wishlist",
      "Backlog",
      "Abandoned",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Now add to user's collection
    await insertGameIntoCollection(userId, igdbId, status);

    res.json({ message: "Game added to collection" });
  } catch (error) {
    console.error("Add game error:", error);
    res.status(500).json({ error: "Failed to add game to collection" });
  }
}

export async function getStatusController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const gameId = parseInt(req.params.id);

    if (isNaN(gameId)) {
      return res.status(400).json({ error: "Invalid game ID" });
    }

    const status = await getUserGameStatus(userId, gameId);

    // Return the status (or null if not found)
    res.json({ status: status || null });
  } catch (error) {
    console.error("Get status error:", error);
    res.status(500).json({ error: "Failed to get game status" });
  }
}
export async function deleteGameFromCollectionController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user!.userId;
    const gameId = parseInt(req.params.id);

    if (isNaN(gameId)) {
      return res.status(400).json({ error: "Invalid game ID" });
    }

    await removeGameFromCollection(userId, gameId);

    res.json({ message: "Game removed from collection" });
  } catch (error) {
    console.error("Delete game error:", error);
    res.status(500).json({ error: "Failed to delete game from collection" });
  }
}

export async function getUserRatingController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const gameId = parseInt(req.params.gameId);

    if (isNaN(gameId)) {
      return res.status(400).json({ error: "Invalid game ID" });
    }

    console.log(`Fetching rating for user ${userId} and game ${gameId}`);
    const rating = await getUserRating(userId, gameId);
    console.log(`Fetched rating: ${rating}`);

    // Return the rating (or null if not found)
    res.json({ rating: rating || null });
  } catch (error) {
    console.error("Get user rating error:", error);
    res.status(500).json({ error: "Failed to get user rating" });
  }
}

export async function changeUserRatingController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const gameId = parseInt(req.params.gameId);
    const { rating } = req.body;

    if (isNaN(gameId)) {
      return res.status(400).json({ error: "Invalid game ID" });
    }

    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ error: "Rating must be a number between 0 and 5" });
    }

    // Update the user's rating for the game
    await updateUserRating(userId, gameId, rating);

    res.json({ message: "User rating updated successfully" });
  } catch (error) {
    console.error("Change user rating error:", error);
    res.status(500).json({ error: "Failed to change user rating" });
  }
}

export async function getRatingController(req: Request, res: Response) {
  try {
    const gameId = parseInt(req.params.gameId);

    if (isNaN(gameId)) {
      return res.status(400).json({ error: "Invalid game ID" });
    }

    const rating = await getRating(gameId);

    // Return the average rating (or null if not found)
    res.json({ rating: rating || null });
  } catch (error) {
    console.error("Get rating error:", error);
    res.status(500).json({ error: "Failed to get game rating" });
  }
}

export async function getUserCollectionController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const status = req.query.status as string; // Puede ser undefined

    const games = await getUserGamesByStatus(userId, status);

    res.json(games);
  } catch (error) {
    console.error("Get collection error:", error);
    res.status(500).json({ error: "Failed to fetch user collection" });
  }
}

export async function getUserProfileController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const stats = await getUserProfileStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Profile stats error:", error);
    res.status(500).json({ error: "Failed to fetch profile stats" });
  }
}

export async function getTrendingGamesController(req: Request, res: Response) {
  try {
    const games = await getTrendingGamesFromDB();
    res.json(games);
  } catch (error) {
    console.error("Trending games error:", error);
    res.status(500).json({ error: "Failed to fetch trending games" });
  }
}