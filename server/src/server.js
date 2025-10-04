import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import boothRoutes from "./routes/boothRoutes.js";
import loyaltyRoutes from "./routes/loyaltyRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import courtRoutes from "./routes/courtRoutes.js";
import gymSessionRoutes from "./routes/gymSessionRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import eventsOfficeRoutes from "./routes/eventsOfficeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cron from "node-cron";
import path from "path";
import { updateCourtSlots } from "./utils/slotGenerator.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import authRoutes from "./routes/authRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Update this to match your frontend URL
    credentials: true,
  })
);

app.use("/api/booths", boothRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/gym-sessions", gymSessionRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/eventsOffice", eventsOfficeRoutes);
cron.schedule("0 0 * * *", () => {
  // runs every day at midnight
  console.log("Updating court slots...");
  updateCourtSlots();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("API running 🚀"));

const PORT = process.env.PORT || 5000;
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
connectDB();
