import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import EventsOffice from "../models/EventsOffice.js";
import Vendor from "../models/Vendor.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // In production, use environment variable!
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Email verification endpoint
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("Missing token");
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).send("User not found");

    // mark user as active
    user.status = "Active";
    await user.save();

    // Redirect to frontend login (could append a query param indicating success)
    return res.redirect(`${FRONTEND_URL}/?verified=1`);
  } catch (err) {
    return res.redirect(`${FRONTEND_URL}/?verified=0`);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return token to client (client will store and send in Authorization header)
    res.json({ success: true, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/check", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.json({ authenticated: false });
    const parts = authHeader.split(" ").filter(Boolean);
    const token =
      parts.length === 2 ? parts[1] : parts.length === 1 ? parts[0] : null;
    if (!token) return res.json({ authenticated: false });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) return res.json({ authenticated: false });
      return res.json({ authenticated: true });
    } catch (err) {
      return res.json({ authenticated: false });
    }
  } catch (err) {
    return res.status(500).json({ authenticated: false });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Not authenticated" });
    const parts = authHeader.split(" ").filter(Boolean);
    const token =
      parts.length === 2 ? parts[1] : parts.length === 1 ? parts[0] : null;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded._id;
    if (!userId) return res.status(401).json({ message: "Invalid token" });

    let user = await User.findById(userId).select(
      "-password -__v -notifications"
    );
    if (!user) user = await Admin.findById(userId).select("-password -__v");
    if (!user)
      user = await EventsOffice.findById(userId).select("-password -__v");
    if (!user) user = await Vendor.findById(userId).select("-password -__v");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

router.post("/logout", (req, res) => {
  res.json({ success: true });
});

export default router;
