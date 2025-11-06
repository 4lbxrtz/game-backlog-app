import express from "express";
import { searchGames } from "../services/igdbService";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    const games = await searchGames(query);
    res.json(games);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to search games" });
  }
});

export default router;
