import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // In production, use environment variable!
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
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
    return res.redirect(`${FRONTEND_URL}/login?verified=1`);
  } catch (err) {
    return res.redirect(`${FRONTEND_URL}/login?verified=0`);
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

    // Set HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE,
    });

    res.json({ success: true });
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
    const token = req.cookies.auth_token;
    if (!token) {
      return res.json({ authenticated: false });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.json({ authenticated: false });
    }

    res.json({ authenticated: true });
  } catch (error) {
    res.json({ authenticated: false });
  }
});

router.post("/logout", (req, res) => {
  res.cookie("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  });
  res.json({ success: true });
});

export default router;
