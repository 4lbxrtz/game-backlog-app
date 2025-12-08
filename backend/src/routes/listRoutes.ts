import express from "express";
import { authenticate } from "../middleware/auth";
import {
  createListController,
  getMyListsController,
  getListDetailsController,
  updateListController,
  deleteListController,
  addGameToListController,
  removeGameFromListController,
} from "../controllers/listController";

const router = express.Router();

// All list routes require authentication
router.use(authenticate);

// List management
router.post("/", createListController); // Create new list
router.get("/", getMyListsController); // Get all my lists
router.get("/:id", getListDetailsController); // Get specific list details
router.put("/:id", updateListController); // Update list info
router.delete("/:id", deleteListController); // Delete list

// List contents (Games)
router.post("/:id/game", addGameToListController); // Add game to list
router.delete("/:id/game/:gameId", removeGameFromListController); // Remove game from list

export default router;
