import dotenv from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv with explicit path to server/.env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
console.log("path:" + path.resolve(__dirname, "../../.env"));

const MONGODB_URI = process.env.MONGODB_URI || "";
console.log("MONGODB_URI:", MONGODB_URI);

const db = async (): Promise<typeof mongoose.connection> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Database connected.");
    return mongoose.connection;
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Database connection failed.");
  }
};

export default db;
