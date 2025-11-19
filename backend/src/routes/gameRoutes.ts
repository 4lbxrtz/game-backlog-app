import express from "express";
import { addGameToCollectionController, searchGamesController } from "../controllers/gameController";
import { getGameController as getGameController } from "../controllers/gameController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

router.get("/search", searchGamesController);
router.get("/:id", getGameController);
router.post("/collection", authenticate, addGameToCollectionController);

export default router;
