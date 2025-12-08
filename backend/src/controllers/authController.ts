import { Request, Response } from "express";
import {
  createUser,
  findUserByEmail,
  emailExists,
  usernameExists,
  findUserById,
  getBacklogGames,
  getCurrentlyPlayingGames,
  getUserLists,
  getUserStats,
  getWishlistGames,
  getCompletedGames,
  getUserById,
  updateUsername,
  updatePassword,
  deleteUser,
} from "../models/userModel";
import { hashPassword, comparePassword, generateToken } from "../utils/auth";
import { UserRegistration, UserLogin } from "../types";

// Register new user
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password }: UserRegistration = req.body;

    // Validation
    if (!username || !email || !password) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // Username validation
    if (username.length < 3 || username.length > 50) {
      res.status(400).json({ error: "Username must be 3-50 characters" });
      return;
    }

    // Email validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    // Password validation
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    // Check if email already exists
    if (await emailExists(email)) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    // Check if username already exists
    if (await usernameExists(username)) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = await createUser(username, email, passwordHash);

    // Generate token
    const token = generateToken({ userId, email });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: userId,
        username,
        email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
}

// Login user
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password }: UserLogin = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Find user
    const user = await findUserByEmail(email);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
}

// Get user dashboard (protected route)
export async function getDashboard(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    // Get user info
    const user = await findUserById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    // Get all dashboard data in parallel (faster!)
    const [stats, currentlyPlaying, backlog, lists, wishlist, completed] =
      await Promise.all([
        getUserStats(userId),
        getCurrentlyPlayingGames(userId, 4),
        getBacklogGames(userId, 8),
        getUserLists(userId),
        getWishlistGames(userId, 8),
        getCompletedGames(userId, 8),
      ]);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
      stats,
      currentlyPlaying,
      backlog,
      lists,
      wishlist,
      completed,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
}

export async function updateProfileController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { username } = req.body;

    if (!username || username.trim().length < 3) {
      return res
        .status(400)
        .json({
          error: "El nombre de usuario debe tener al menos 3 caracteres",
        });
    }

    // Verificar si el nombre ya existe
    const exists = await usernameExists(username);
    if (exists) {
      // Verificamos si es el mismo usuario
      const currentUser = await getUserById(userId);
      if (currentUser.username !== username) {
        return res
          .status(409)
          .json({ error: "Este nombre de usuario ya está en uso" });
      }
    }

    await updateUsername(userId, username);
    res.json({ message: "Perfil actualizado correctamente", username });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
}

// Actualizar Contraseña
export async function updatePasswordController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .json({
          error: "La nueva contraseña debe tener al menos 8 caracteres",
        });
    }

    // 1. Obtener usuario para comprobar la contraseña actual
    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // 2. Verificar contraseña actual
    const validPassword = await comparePassword(
      currentPassword,
      user.password_hash
    );
    if (!validPassword) {
      return res
        .status(401)
        .json({ error: "La contraseña actual es incorrecta" });
    }

    // 3. Hashear nueva contraseña
    const hash = await hashPassword(newPassword);

    // 4. Guardar
    await updatePassword(userId, hash);
    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ error: "Error al actualizar contraseña" });
  }
}

// Eliminar Cuenta
export async function deleteAccountController(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    await deleteUser(userId);
    res.json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Error al eliminar la cuenta" });
  }
}
