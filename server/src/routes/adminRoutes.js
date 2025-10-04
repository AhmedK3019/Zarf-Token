import adminController from "../controllers/adminController.js";
import express from "express";
const router = express.Router();

router.post("/createAdmin", adminController.createAdmin);

export default router;
