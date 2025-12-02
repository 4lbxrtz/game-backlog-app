import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Interfaces
export interface CustomList {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  games?: any[]; // For when we fetch the list with games
  game_count?: number; // <--- New
  covers?: string[]; // <--- New (Array of URLs)
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

export async function getUserLists(userId: number): Promise<CustomList[]> {
  // We use a LEFT JOIN to count games and a Subquery (or JSON_ARRAYAGG) to get covers.
  // This query groups by list and fetches details.
  const query = `
    SELECT 
      l.id, 
      l.name, 
      l.description,
      COUNT(lg.game_id) as game_count,
      (
        SELECT JSON_ARRAYAGG(g.cover_url)
        FROM list_games lg2
        JOIN games g ON lg2.game_id = g.id
        WHERE lg2.list_id = l.id
      ) as covers
    FROM lists l
    LEFT JOIN list_games lg ON l.id = lg.list_id
    WHERE l.user_id = ?
    GROUP BY l.id, l.name, l.description
    ORDER BY l.id DESC
  `;

  const [rows] = await pool.query<RowDataPacket[]>(query, [userId]);

  // Parse the JSON string returned by JSON_ARRAYAGG (if your MySQL driver doesn't auto-parse)
  return rows.map((row) => ({
    ...row,
    covers: row.covers
      ? typeof row.covers === "string"
        ? JSON.parse(row.covers)
        : row.covers
      : [],
  })) as CustomList[];
}

export async function getListById(listId: number): Promise<CustomList | null> {
  // PASO 1: Obtener metadatos de la lista (Nombre, descripción...)
  const [listRows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM lists WHERE id = ?",
    [listId]
  );

  // Si no existe la lista, devolvemos null inmediatamente
  if (listRows.length === 0) return null;

  const list = listRows[0] as CustomList;

  // PASO 2: Obtener los juegos de esa lista (si los tiene)
  // Usamos LEFT JOIN con user_games para saber si el usuario los ha completado (status)
  const [gameRows] = await pool.query<RowDataPacket[]>(
    `SELECT 
        g.id, 
        g.title, 
        g.cover_url, 
        g.release_date,
        ug.status,
        ug.personal_rating
     FROM list_games lg
     JOIN games g ON lg.game_id = g.id
     JOIN lists l ON lg.list_id = l.id
     LEFT JOIN user_games ug ON g.id = ug.game_id AND l.user_id = ug.user_id
     WHERE lg.list_id = ?
     ORDER BY lg.game_id DESC`,
    [listId]
  );

  // Devolvemos la lista combinada con sus juegos (o array vacío si no tiene)
  return {
    ...list,
    games: gameRows as any[], // El 'as any[]' evita conflictos de tipos menores
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
