import express from "express";
import {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  registerStudent,
  getSessionsByMonth,
  unregisterStudent,
} from "../controllers/gymSessionController.js";

const router = express.Router();

router.post("/", createSession);
router.get("/", getSessions);
router.get("/:id", getSessionById);
router.put("/:id", updateSession);
router.get("/month/:month", getSessionsByMonth);
router.delete("/:id", deleteSession);

// Register/unregister student
router.post("/:id/register", registerStudent);
router.post("/:id/unregister", unregisterStudent);

export default router;
