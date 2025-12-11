import express from "express";
import {
  addGameToCollectionController,
  getTrendingGamesController,
  getUserCollectionController,
  getUserProfileController,
  searchGamesController,
} from "../controllers/gameController";
import { getGameController as getGameController } from "../controllers/gameController";
import { getStatusController } from "../controllers/gameController";
import { deleteGameFromCollectionController } from "../controllers/gameController";
import { getUserRatingController } from "../controllers/gameController";
import { getRatingController } from "../controllers/gameController";
import { changeUserRatingController } from "../controllers/gameController";
import { getCountRatingsController } from "../controllers/gameController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.get("/", authenticate, getUserCollectionController);
router.get("/trending", authenticate, getTrendingGamesController);
router.get("/search", authenticate, searchGamesController);
router.get("/:id", authenticate, getGameController);
router.post("/collection", authenticate, addGameToCollectionController);
router.get("/:id/status", authenticate, getStatusController);
router.delete("/:id", authenticate, deleteGameFromCollectionController);
router.get("/:gameId/rating/user", authenticate, getUserRatingController);
router.get("/:gameId/rating", authenticate, getRatingController);
router.put("/:gameId/rating/user", authenticate, changeUserRatingController);
router.get("/:gameId/rating/counts", authenticate, getCountRatingsController);
router.get("/profile/stats", authenticate, getUserProfileController);
export default router;
