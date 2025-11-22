import pollController from "../controllers/pollController.js";
import express from "express";

const router = express.Router();

router.post("/", pollController.createPoll);
router.get("/", pollController.getPoll);
router.post("/vote", pollController.voteInPoll);

export default router;
