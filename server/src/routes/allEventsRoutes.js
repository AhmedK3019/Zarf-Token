import AllEventsController from "../controllers/AllEventsController.js";
import express from "express";
const router = express.Router();

router.get("/getAllEvents", AllEventsController.getAllEvents);
router.get("/getEventsByType/:type", AllEventsController.getEventsByType);
router.get(
  "/getEventsRegisteredByMe/:userId",
  AllEventsController.getEventsRegisteredByUser
);

export default router;
