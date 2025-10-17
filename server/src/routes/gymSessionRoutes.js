import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  registerUser,
  getSessionsByMonth,
  unregisterUser,
  deleteMonthSessions,
} from "../controllers/gymSessionController.js";

const router = express.Router();

router.post("/", authMiddleware, createSession); // Events Office only
router.get("/", getSessions);
router.get("/:id", getSessionById);
router.put("/:id", authMiddleware, updateSession); // Events Office only
router.get("/month/:month", getSessionsByMonth);
router.delete("/month/:month", authMiddleware, deleteMonthSessions); // Delete all sessions for a month - Events Office only
router.delete("/:id", authMiddleware, deleteSession); // Events Office only

// Register/unregister user (Student, Staff, Events Office, TA, Professor) - require authentication
router.post("/:id/register", authMiddleware, registerUser);
router.post("/:id/unregister", authMiddleware, unregisterUser);

export default router;
