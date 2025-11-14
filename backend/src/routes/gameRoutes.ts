import express from "express";
import { searchGamesController } from "../controllers/gameController";

const router = express.Router();

router.get("/search", searchGamesController);

export default router;
