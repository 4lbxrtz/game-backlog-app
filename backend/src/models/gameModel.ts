import pool from "../config/database";
import { RowDataPacket } from "mysql2";

// TypeScript interfaces for type safety
interface Game {
  id: number;
  title: string;
  cover_url?: string;
  description?: string;
  release_date?: Date;
}

interface Genre {
  id: number;
  name: string;
}

interface Platform {
  id: number;
  name: string;
}

// Check if a game exists in database
export async function gameExists(igdbId: number): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM games WHERE id = ?",
    [igdbId]
  );
  return rows.length > 0;
}

// Get game with all its metadata (genres, platforms)
export async function getGameById(igdbId: number): Promise<any> {
  // Get basic game info
  const [gameRows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM games WHERE id = ?",
    [igdbId]
  );

  if (gameRows.length === 0) return null;

  const game = gameRows[0];

  // Get genres for this game
  const [genreRows] = await pool.query<RowDataPacket[]>(
    `SELECT g.id, g.name 
     FROM genres g
     JOIN game_genres gg ON g.id = gg.genre_id
     WHERE gg.game_id = ?`,
    [igdbId]
  );

  // Get platforms for this game
  const [platformRows] = await pool.query<RowDataPacket[]>(
    `SELECT p.id, p.name 
     FROM platforms p
     JOIN game_platforms gp ON p.id = gp.platform_id
     WHERE gp.game_id = ?`,
    [igdbId]
  );

  return {
    ...game,
    genres: genreRows,
    platforms: platformRows,
  };
}

// Insert or update a genre
export async function upsertGenre(id: number, name: string): Promise<void> {
  await pool.query(
    `INSERT INTO genres (id, name) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE name = ?`,
    [id, name, name]
  );
}

// Insert or update a platform
export async function upsertPlatform(id: number, name: string): Promise<void> {
  await pool.query(
    `INSERT INTO platforms (id, name) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE name = ?`,
    [id, name, name]
  );
}

// Link a game to a genre
export async function linkGameGenre(
  gameId: number,
  genreId: number
): Promise<void> {
  await pool.query(
    `INSERT IGNORE INTO game_genres (game_id, genre_id) VALUES (?, ?)`,
    [gameId, genreId]
  );
}

// Link a game to a platform
export async function linkGamePlatform(
  gameId: number,
  platformId: number
): Promise<void> {
  await pool.query(
    `INSERT IGNORE INTO game_platforms (game_id, platform_id) VALUES (?, ?)`,
    [gameId, platformId]
  );
}

// Main function: Store complete game metadata
export async function storeGameMetadata(igdbGame: any): Promise<void> {
  const connection = await pool.getConnection();

  try {
    // Start a transaction (all-or-nothing - if one fails, rollback everything)
    await connection.beginTransaction();

    // 1. Insert the game
    await connection.query(
      `INSERT INTO games (id, title, cover_url, description, release_date)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         cover_url = VALUES(cover_url),
         description = VALUES(description),
         release_date = VALUES(release_date)`,
      [
        igdbGame.id,
        igdbGame.name,
        igdbGame.cover?.url || null,
        igdbGame.summary || null,
        igdbGame.first_release_date
          ? new Date(igdbGame.first_release_date * 1000) // IGDB returns Unix timestamp
          : null,
      ]
    );

    // 2. Insert genres
    if (igdbGame.genres && igdbGame.genres.length > 0) {
      for (const genre of igdbGame.genres) {
        await connection.query(
          `INSERT INTO genres (id, name) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name)`,
          [genre.id, genre.name]
        );

        // Link game to genre
        await connection.query(
          `INSERT IGNORE INTO game_genres (game_id, genre_id) VALUES (?, ?)`,
          [igdbGame.id, genre.id]
        );
      }
    }

    // 3. Insert platforms
    if (igdbGame.platforms && igdbGame.platforms.length > 0) {
      for (const platform of igdbGame.platforms) {
        await connection.query(
          `INSERT INTO platforms (id, name) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name)`,
          [platform.id, platform.name]
        );

        // Link game to platform
        await connection.query(
          `INSERT IGNORE INTO game_platforms (game_id, platform_id) VALUES (?, ?)`,
          [igdbGame.id, platform.id]
        );
      }
    }

    // Commit the transaction
    await connection.commit();
  } catch (error) {
    // If anything fails, undo everything
    await connection.rollback();
    throw error;
  } finally {
    // Always release the connection back to pool
    connection.release();
  }
}
