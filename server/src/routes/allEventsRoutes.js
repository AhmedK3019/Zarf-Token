import AllEventsController from "../controllers/AllEventsController.js";
import express from "express";
const router = express.Router();

router.get("/getAllEvents", AllEventsController.getAllEvents);
router.get("/getEventsByType/:type", AllEventsController.getEventsByType);
router.get(
  "/getEventsRegisteredByMe/:userId",
  AllEventsController.getEventsRegisteredByUser
);
router.patch("/addComment/:id/:type", AllEventsController.addComment);
router.patch("/rateEvent/:id/:type", AllEventsController.rateEvent);

router.get("/viewAllComments/:id/:type", AllEventsController.viewAllComments);

router.get("/viewAllRatings/:id/:type", AllEventsController.viewAllRatings);
export default router;
