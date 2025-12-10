import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { User } from "../types";

export interface ProfileStats {
  totalPlayed: number;
  playedThisYear: number;
  backlogCount: number;
  ratings: { rating: number; count: number }[];
  topGenres: { name: string; count: number }[];
  platforms: { name: string }[];
  gamesPerYear: { year: number; count: number }[];
  recentGames: any[];
  totalMinutesPlayed: number; // New
  statusDistribution: { status: string; count: number }[]; // New
  gamesPerDecade: { decade: number; count: number }[]; // New
}

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

export async function getUserById(id: number): Promise<any> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE id = ?",
    [id]
  );
  return rows[0];
}

// Actualizar Username
export async function updateUsername(
  id: number,
  newUsername: string
): Promise<void> {
  await pool.query("UPDATE users SET username = ? WHERE id = ?", [
    newUsername,
    id,
  ]);
}

// Actualizar Contraseña
export async function updatePassword(
  id: number,
  passwordHash: string
): Promise<void> {
  await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
    passwordHash,
    id,
  ]);
}

// Eliminar Cuenta
export async function deleteUser(id: number): Promise<void> {
  await pool.query("DELETE FROM users WHERE id = ?", [id]);
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

// Get user's wishlist games
export async function getWishlistGames(userId: number, limit: number = 6) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT g.id, g.title, g.cover_url
    FROM games g
    JOIN user_games ug ON g.id = ug.game_id
    WHERE ug.user_id = ? AND ug.status = 'Wishlist'
    ORDER BY ug.added_at DESC
    LIMIT ?`,
    [userId, limit]
  );

  return rows;
}

// Get user's completed games
export async function getCompletedGames(userId: number, limit: number = 6) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT g.id, g.title, g.cover_url
    FROM games g
    JOIN user_games ug ON g.id = ug.game_id
    WHERE ug.user_id = ? AND ug.status = 'Completed'
    ORDER BY ug.updated_at DESC
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

export async function getUserGamesByStatus(
  userId: number,
  status?: string
): Promise<any[]> {
  let query = `
    SELECT 
      g.id, 
      g.title, 
      g.cover_url, 
      g.release_date, 
      ug.status, 
      ug.personal_rating,
      ug.added_at
    FROM user_games ug
    JOIN games g ON ug.game_id = g.id
    WHERE ug.user_id = ?
  `;

  const params: any[] = [userId];

  // Si nos pasan un estado específico, filtramos. Si no, devolvemos todo.
  if (status && status !== "All") {
    query += " AND ug.status = ?";
    params.push(status);
  }

  // Ordenamos por fecha de actualización (los más recientes primero por defecto)
  query += " ORDER BY ug.updated_at DESC";

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows;
}

export async function getUserProfileStats(
  userId: number
): Promise<ProfileStats> {
  const connection = await pool.getConnection();

  try {
    // 1. General Counts
    const [counts] = await connection.query<RowDataPacket[]>(
      `
      SELECT 
        (SELECT COUNT(*) FROM user_games WHERE user_id = ? AND status = 'Completed') as totalPlayed,
        (SELECT COUNT(*) FROM user_games WHERE user_id = ? AND status = 'Backlog') as backlogCount,
        (SELECT COUNT(*) FROM logs WHERE user_id = ? AND YEAR(end_date) = YEAR(CURDATE())) as playedThisYear
    `,
      [userId, userId, userId]
    );

    // 2. Rating Distribution (Group by rounded rating)
    const [ratings] = await connection.query<RowDataPacket[]>(
      `
      SELECT FLOOR(personal_rating) as rating, COUNT(*) as count
      FROM user_games 
      WHERE user_id = ? AND personal_rating IS NOT NULL
      GROUP BY FLOOR(personal_rating)
      ORDER BY rating DESC
    `,
      [userId]
    );

    // 3. Top 5 Genres
    const [genres] = await connection.query<RowDataPacket[]>(
      `
      SELECT g.name, COUNT(*) as count
      FROM user_games ug
      JOIN game_genres gg ON ug.game_id = gg.game_id
      JOIN genres g ON gg.genre_id = g.id
      WHERE ug.user_id = ?
      GROUP BY g.id, g.name
      ORDER BY count DESC
      LIMIT 5
    `,
      [userId]
    );

    // 4. Platforms Used (Source: LOGS - The real platforms played)
    const [platforms] = await connection.query<RowDataPacket[]>(
      `
      SELECT p.name, COUNT(*) as count
      FROM logs l
      JOIN platforms p ON l.platform_id = p.id
      WHERE l.user_id = ?
      GROUP BY p.id, p.name
      ORDER BY count DESC
      LIMIT 10
    `,
      [userId]
    );

    // 5. Games Added per Year (Activity)
    const [years] = await connection.query<RowDataPacket[]>(
      `
      SELECT YEAR(added_at) as year, COUNT(*) as count
      FROM user_games
      WHERE user_id = ?
      GROUP BY YEAR(added_at)
      ORDER BY year ASC
      LIMIT 5
    `,
      [userId]
    );

    // 6. Recently Played/Updated
    const [recent] = await connection.query<RowDataPacket[]>(
      `
      SELECT g.id, g.title, g.cover_url, ug.updated_at
      FROM user_games ug
      JOIN games g ON ug.game_id = g.id
      WHERE ug.user_id = ? AND ug.status IN ('Playing', 'Completed')
      ORDER BY ug.updated_at DESC
      LIMIT 5
    `,
      [userId]
    );

    const [playtime] = await connection.query<RowDataPacket[]>(
      `
      SELECT SUM(time_played) as totalMinutes
      FROM logs
      WHERE user_id = ?
    `,
      [userId]
    );

    // NEW 2: Full Status Distribution (for the Donut Chart)
    const [statuses] = await connection.query<RowDataPacket[]>(
      `
      SELECT status, COUNT(*) as count
      FROM user_games
      WHERE user_id = ?
      GROUP BY status
    `,
      [userId]
    );

    // NEW 3: Games per Decade (Retro vs Modern)
    const [decades] = await connection.query<RowDataPacket[]>(
      `
      SELECT 
        FLOOR(YEAR(release_date) / 10) * 10 as decade,
        COUNT(*) as count
      FROM user_games ug
      JOIN games g ON ug.game_id = g.id
      WHERE ug.user_id = ? AND g.release_date IS NOT NULL
      GROUP BY decade
      ORDER BY decade ASC
    `,
      [userId]
    );

    return {
      totalPlayed: counts[0]?.totalPlayed || 0,
      backlogCount: counts[0]?.backlogCount || 0,
      playedThisYear: counts[0]?.playedThisYear || 0,
      ratings: ratings as any[],
      topGenres: genres as any[],
      platforms: platforms as any[],
      gamesPerYear: years as any[],
      recentGames: recent as any[],
      totalMinutesPlayed: playtime[0]?.totalMinutes || 0,
      statusDistribution: statuses as any[],
      gamesPerDecade: decades as any[],
    };
  } finally {
    connection.release();
  }
}
