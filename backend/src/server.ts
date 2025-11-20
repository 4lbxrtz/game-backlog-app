import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import gameRoutes from "./routes/gameRoutes";
import pool from "./config/database";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// CORS Configuration - MUST BE BEFORE ROUTES
const corsOptions = {
  // origin: ["http://localhost:5173", "http://localhost:5174"], // Your React app URL
  origin: "*", // Allow all origins for testing purposes
  credentials: true, // Allow cookies/auth headers
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/games", gameRoutes);
app.use("/api/auth", authRoutes);

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
