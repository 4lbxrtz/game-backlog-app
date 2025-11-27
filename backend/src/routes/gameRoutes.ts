import express from "express";
import { addGameToCollectionController, searchGamesController } from "../controllers/gameController";
import { getGameController as getGameController } from "../controllers/gameController";
import { getStatusController } from "../controllers/gameController";
import { deleteGameFromCollectionController } from "../controllers/gameController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.get("/search", searchGamesController);
router.get("/:id", getGameController);
router.post("/collection", authenticate, addGameToCollectionController);
router.get("/:id/status", authenticate, getStatusController);
router.delete("/:id", authenticate, deleteGameFromCollectionController);
export default router;
