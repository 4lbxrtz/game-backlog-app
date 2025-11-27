import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Log {
  id: number;
  title: string;
  user_id: number;
  game_id: number;
  platform_id?: number;
  platform_name?: string; // We'll get this via JOIN
  time_played?: number; // stored in minutes
  start_date?: Date;
  end_date?: Date;
  review?: string;
  created_at?: Date;
  updated_at?: Date;
}

// 1. Create a new log
export async function createLog(
  userId: number,
  gameId: number,
  data: Partial<Log>
): Promise<number> {
  const { title, platform_id, time_played, start_date, end_date, review } =
    data;

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO logs (title, user_id, game_id, platform_id, time_played, start_date, end_date, review) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      userId,
      gameId,
      platform_id || null,
      time_played || 0,
      start_date || null,
      end_date || null,
      review || null,
    ]
  );

  return result.insertId;
}

// 2. Get all logs for a specific game and user
export async function getLogsByGame(
  userId: number,
  gameId: number
): Promise<Log[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
        l.*,
        p.name as platform_name
     FROM logs l
     LEFT JOIN platforms p ON l.platform_id = p.id
     WHERE l.user_id = ? AND l.game_id = ?
     ORDER BY l.created_at DESC`,
    [userId, gameId]
  );
  return rows as Log[];
}

// 3. Get a single log (by ID)
export async function getLogById(logId: number): Promise<Log | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM logs WHERE id = ?",
    [logId]
  );
  return rows.length > 0 ? (rows[0] as Log) : null;
}

// 4. Update a log
export async function updateLog(
  logId: number,
  data: Partial<Log>
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  // Dynamically build query
  if (data.title !== undefined) {
    fields.push("title = ?");
    values.push(data.title);
  }
  if (data.platform_id !== undefined) {
    fields.push("platform_id = ?");
    values.push(data.platform_id);
  }
  if (data.time_played !== undefined) {
    fields.push("time_played = ?");
    values.push(data.time_played);
  }
  if (data.start_date !== undefined) {
    fields.push("start_date = ?");
    values.push(data.start_date);
  }
  if (data.end_date !== undefined) {
    fields.push("end_date = ?");
    values.push(data.end_date);
  }
  if (data.review !== undefined) {
    fields.push("review = ?");
    values.push(data.review);
  }

  if (fields.length === 0) return;

  values.push(logId);

  await pool.query(`UPDATE logs SET ${fields.join(", ")} WHERE id = ?`, values);
}

// 5. Delete a log
export async function deleteLog(logId: number): Promise<void> {
  await pool.query("DELETE FROM logs WHERE id = ?", [logId]);
}
