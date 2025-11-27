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

export async function getUserStats(userId: number) {
  // Get counts by status
  const [statusRows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      status,
      COUNT(*) as count
    FROM user_games
    WHERE user_id = ?
    GROUP BY status`,
    [userId]
  );

  // Get average rating
  const [ratingRows] = await pool.query<RowDataPacket[]>(
    `SELECT AVG(personal_rating) as avg_rating
    FROM user_games
    WHERE user_id = ? AND personal_rating IS NOT NULL`,
    [userId]
  );

  // Format the stats
  const stats: Record<string, number> = {
    Completed: 0,
    Playing: 0,
    Backlog: 0,
    Wishlist: 0,
    Abandoned: 0,
  };

  statusRows.forEach((row: any) => {
    stats[row.status] = row.count;
  });

  return {
    completed: stats.Completed,
    playing: stats.Playing,
    backlog: stats.Backlog,
    wishlist: stats.Wishlist,
    abandoned: stats.Abandoned,
    averageRating: ratingRows[0]?.avg_rating
      ? parseFloat(ratingRows[0].avg_rating).toFixed(1)
      : "0.0",
  };
}

// Get user's currently playing games
export async function getCurrentlyPlayingGames(
  userId: number,
  limit: number = 3
) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT g.id, g.title, g.cover_url
    FROM games g
    JOIN user_games ug ON g.id = ug.game_id
    WHERE ug.user_id = ? AND ug.status = 'Playing'
    ORDER BY ug.updated_at DESC
    LIMIT ?`,
    [userId, limit]
  );

  return rows;
}

// Get user's backlog games
export async function getBacklogGames(userId: number, limit: number = 6) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT g.id, g.title, g.cover_url
    FROM games g
    JOIN user_games ug ON g.id = ug.game_id
    WHERE ug.user_id = ? AND ug.status = 'Backlog'
    ORDER BY ug.added_at DESC
    LIMIT ?`,
    [userId, limit]
  );

  return rows;
}

// Get user's custom lists
export async function getUserLists(userId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      l.id,
      l.name,
      l.description,
      COUNT(lg.game_id) as game_count
    FROM lists l
    LEFT JOIN list_games lg ON l.id = lg.list_id
    WHERE l.user_id = ?
    GROUP BY l.id`,
    [userId]
  );

  return rows;
}

export async function insertGameIntoCollection(
  userId: number,
  gameId: number,
  status: string
): Promise<void> {
  await pool.query(
    `INSERT INTO user_games (user_id, game_id, status, added_at, updated_at)
    VALUES (?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE status = ?, updated_at = NOW()`,
    [userId, gameId, status, status]
  );
}

export async function updateGameStatus(
  userId: number,
  gameId: number,
  status: string
): Promise<void> {
  await pool.query(
    `UPDATE user_games
    SET status = ?, updated_at = NOW()
    WHERE user_id = ? AND game_id = ?`,
    [status, userId, gameId]
  );
}

export async function getUserGameStatus(
  userId: number,
  gameId: number
): Promise<string | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT status, personal_rating FROM user_games WHERE user_id = ? AND game_id = ?",
    [userId, gameId]
  );

  if (rows.length > 0) {
    return rows[0].status;
  }
  return null;
}

export async function removeGameFromCollection(
  userId: number,
  gameId: number
): Promise<void> {
  await pool.query(
    `DELETE FROM user_games
    WHERE user_id = ? AND game_id = ?`,
    [userId, gameId]
  );
}
