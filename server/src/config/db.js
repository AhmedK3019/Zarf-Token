import mongoose from "mongoose";
import User from "../models/User";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Check if admin user exists
    const adminExists = await User.findOne({ username: "admin" });
    if (!adminExists) {
      console.log("Creating admin user...");
      await User.create({
        username: "admin",
        password: "admin123",
      });
      console.log("Admin user created successfully");
    }
    console.log("✅ MongoDB Connected...");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;
