import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { User } from "../types";

// Create a new user
export async function createUser(
  username: string,
  email: string,
  passwordHash: string
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
    [username, email, passwordHash]
  );
  return result.insertId;
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (rows.length === 0) return null;
  return rows[0] as User;
}

// Find user by username
export async function findUserByUsername(
  username: string
): Promise<User | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );

  if (rows.length === 0) return null;
  return rows[0] as User;
}

// Find user by ID
export async function findUserById(id: number): Promise<User | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE id = ?",
    [id]
  );

  if (rows.length === 0) return null;
  return rows[0] as User;
}

// Check if email exists
export async function emailExists(email: string): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );
  return rows.length > 0;
}

// Check if username exists
export async function usernameExists(username: string): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE username = ?",
    [username]
  );
  return rows.length > 0;
}
