import express from "express";
import {
  register,
  login,
  getDashboard,
  updateProfileController,
  updatePasswordController,
  deleteAccountController,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/dashboard", authenticate, getDashboard);
router.put("/profile", authenticate, updateProfileController);
router.put("/password", authenticate, updatePasswordController);
router.delete("/account", authenticate, deleteAccountController);

export default router;
