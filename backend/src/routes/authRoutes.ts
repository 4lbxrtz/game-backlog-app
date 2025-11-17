import express from "express";
import { register, login, getDashboard } from "../controllers/authController";
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

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/dashboard", authenticate, getDashboard);

export default router;
