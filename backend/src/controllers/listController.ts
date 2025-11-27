import { Request, Response } from "express";
import {
  createList,
  getUserLists,
  getListById,
  updateList,
  deleteList,
  checkListOwnership,
  addGameToList,
  removeGameFromList,
} from "../models/listModel";
import { gameExists, storeGameMetadata } from "../models/gameModel";
import { getGameDetails } from "../services/igdbService";

// Create a new list
export async function createListController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "List name is required" });
    }

    const listId = await createList(userId, name, description || "");
    res.status(201).json({ message: "List created", listId });
  } catch (error) {
    console.error("Create list error:", error);
    res.status(500).json({ error: "Failed to create list" });
  }
}

// Get all lists for the logged-in user
export async function getMyListsController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const lists = await getUserLists(userId);
    res.json(lists);
  } catch (error) {
    console.error("Get lists error:", error);
    res.status(500).json({ error: "Failed to fetch lists" });
  }
}

// Get a single list details
export async function getListDetailsController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const listId = parseInt(req.params.id);

    // Check ownership or if you want lists to be public later, change this logic
    const isOwner = await checkListOwnership(listId, userId);
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied or list not found" });
    }

    const list = await getListById(listId);
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    res.json(list);
  } catch (error) {
    console.error("Get list details error:", error);
    res.status(500).json({ error: "Failed to fetch list details" });
  }
}

// Update list
export async function updateListController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const listId = parseInt(req.params.id);
    const { name, description } = req.body;

    const isOwner = await checkListOwnership(listId, userId);
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }

    await updateList(listId, name, description);
    res.json({ message: "List updated successfully" });
  } catch (error) {
    console.error("Update list error:", error);
    res.status(500).json({ error: "Failed to update list" });
  }
}

// Delete list
export async function deleteListController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const listId = parseInt(req.params.id);

    const isOwner = await checkListOwnership(listId, userId);
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }

    await deleteList(listId);
    res.json({ message: "List deleted successfully" });
  } catch (error) {
    console.error("Delete list error:", error);
    res.status(500).json({ error: "Failed to delete list" });
  }
}

// Add a game to a list
export async function addGameToListController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const listId = parseInt(req.params.id);
    const { igdbId } = req.body;

    if (!igdbId) {
      return res.status(400).json({ error: "igdbId is required" });
    }

    // 1. Check list ownership
    const isOwner = await checkListOwnership(listId, userId);
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }

    // 2. Ensure game exists in our local DB (Metadata check)
    // This is the same logic as your gameController
    const exists = await gameExists(igdbId);
    if (!exists) {
      // Fetch from IGDB and store
      const igdbGame = await getGameDetails(igdbId);
      if (!igdbGame) {
        return res.status(404).json({ error: "Game not found in IGDB" });
      }
      await storeGameMetadata(igdbGame);
    }

    // 3. Add to list
    await addGameToList(listId, igdbId);
    res.json({ message: "Game added to list" });
  } catch (error) {
    console.error("Add game to list error:", error);
    res.status(500).json({ error: "Failed to add game to list" });
  }
}

// Remove a game from a list
export async function removeGameFromListController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user!.userId;
    const listId = parseInt(req.params.id);
    const gameId = parseInt(req.params.gameId);

    const isOwner = await checkListOwnership(listId, userId);
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }

    await removeGameFromList(listId, gameId);
    res.json({ message: "Game removed from list" });
  } catch (error) {
    console.error("Remove game from list error:", error);
    res.status(500).json({ error: "Failed to remove game from list" });
  }
}
