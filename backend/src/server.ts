import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import gameRoutes from "./routes/gameRoutes";
import pool from "./config/database";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

app.use("/api/games", gameRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

pool
  .getConnection()
  .then((connection) => {
    console.log("Database connected successfully");
    connection.release();
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
