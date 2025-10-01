import express from "express";
import { createForm, getForms } from "../controllers/loyaltyController.js";

const router = express.Router();

router.post("/", createForm);
router.get("/", getForms);

export default router;
