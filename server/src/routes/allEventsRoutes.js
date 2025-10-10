import AllEventsController from "../controllers/AllEventsController.js";
import express from "express";
const router = express.Router();

router.get("/getAllEvents", AllEventsController.getAllEvents);

export default router;
