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
import cron from "node-cron";
import { updateCourtSlots } from "./utils/slotGenerator.js";

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
cron.schedule("0 0 * * *", () => {
  // runs every day at midnight
  console.log("Updating court slots...");
  updateCourtSlots();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("API running 🚀"));

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => console.log(err));
