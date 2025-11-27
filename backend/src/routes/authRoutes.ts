import express from "express";
import { register, login, getDashboard } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/dashboard", authenticate, getDashboard);

export default router;
