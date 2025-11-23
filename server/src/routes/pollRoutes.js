import * as pollController from "../controllers/pollController.js";
import express from "express";

const router = express.Router();

router.post("/", pollController.createPoll);
router.get("/active", pollController.getActivePolls);
router.get("/:pollId", pollController.getPoll);
router.get("/", pollController.getAllPolls);
router.post("/vote", pollController.voteInPoll);
router.post("/:pollId/end", pollController.endPoll);
router.delete("/:pollId", pollController.deletePoll);

export default router;
