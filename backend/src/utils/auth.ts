import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_change_this";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Hash password with Argon2
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id, // Recommended variant (secure & memory-hard)
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3, // Number of iterations
    parallelism: 1, // Threads
  });
}

// Compare password with hash
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return argon2.verify(hash, password);
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    throw new Error("Invalid or expired token");
  }
}
