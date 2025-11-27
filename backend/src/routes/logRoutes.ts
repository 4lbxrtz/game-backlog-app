import express from "express";
import { authenticate } from "../middleware/auth";
import {
  createLogController,
  getGameLogsController,
  updateLogController,
  deleteLogController,
} from "../controllers/logController";

const router = express.Router();

router.use(authenticate);

// GET /api/logs/game/:gameId
// Returns all logs for a specific game (e.g., Bloodborne)
router.get("/game/:gameId", getGameLogsController);

// POST /api/logs
// Body: { gameId, title, platformId?, timePlayed?, startDate?, endDate?, review? }
router.post("/", createLogController);

// PUT /api/logs/:id
// Body: { title?, platformId?, timePlayed?, ... }
router.put("/:id", updateLogController);

// DELETE /api/logs/:id
router.delete("/:id", deleteLogController);

export default router;
