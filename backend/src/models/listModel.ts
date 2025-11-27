import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Interfaces
export interface CustomList {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  games?: any[]; // For when we fetch the list with games
}

// 1. Create a new list
export async function createList(
  userId: number,
  name: string,
  description: string
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO lists (user_id, name, description) VALUES (?, ?, ?)",
    [userId, name, description]
  );
  return result.insertId;
}

// 2. Get all lists for a specific user (just metadata, no games)
export async function getUserLists(userId: number): Promise<CustomList[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, description FROM lists WHERE user_id = ?",
    [userId]
  );
  return rows as CustomList[];
}

// 3. Get a specific list with all its games
export async function getListById(listId: number): Promise<CustomList | null> {
  // First get the list metadata
  const [listRows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM lists WHERE id = ?",
    [listId]
  );

  if (listRows.length === 0) return null;

  const list = listRows[0] as CustomList;

  // Now get the games associated with this list
  // We join with the games table to get title, cover, etc.
  const [gameRows] = await pool.query<RowDataPacket[]>(
    `SELECT g.id, g.title, g.cover_url, g.release_date 
     FROM games g
     JOIN list_games lg ON g.id = lg.game_id
     WHERE lg.list_id = ?`,
    [listId]
  );

  return {
    ...list,
    games: gameRows,
  };
}

// 4. Check if a user owns a specific list (Security check)
export async function checkListOwnership(
  listId: number,
  userId: number
): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM lists WHERE id = ? AND user_id = ?",
    [listId, userId]
  );
  return rows.length > 0;
}

// 5. Update list details
export async function updateList(
  listId: number,
  name: string,
  description: string
): Promise<void> {
  await pool.query("UPDATE lists SET name = ?, description = ? WHERE id = ?", [
    name,
    description,
    listId,
  ]);
}

// 6. Delete a list
export async function deleteList(listId: number): Promise<void> {
  // Due to ON DELETE CASCADE in your schema, this automatically removes entries from list_games
  await pool.query("DELETE FROM lists WHERE id = ?", [listId]);
}

// 7. Add a game to a list
export async function addGameToList(
  listId: number,
  gameId: number
): Promise<void> {
  await pool.query(
    "INSERT IGNORE INTO list_games (list_id, game_id) VALUES (?, ?)",
    [listId, gameId]
  );
}

// 8. Remove a game from a list
export async function removeGameFromList(
  listId: number,
  gameId: number
): Promise<void> {
  await pool.query("DELETE FROM list_games WHERE list_id = ? AND game_id = ?", [
    listId,
    gameId,
  ]);
}
