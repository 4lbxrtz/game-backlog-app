import pool from "../config/database";
import { RowDataPacket } from "mysql2";

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
