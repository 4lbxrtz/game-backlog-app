import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";

// Middleware to protect routes
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token
    const payload = verifyToken(token);

    // Attach user info to request
    req.user = payload;

    // Continue to next middleware/route
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Optional middleware - doesn't fail if no token
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      req.user = verifyToken(token);
    }

    next();
  } catch (error) {
    // Invalid token, but we continue anyway
    next();
  }
}
