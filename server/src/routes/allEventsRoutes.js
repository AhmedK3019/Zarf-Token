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

router.delete(
  "/deleteComment/:id/:commentid/:type",
  AllEventsController.deleteComment
);
router.delete("/removeRate/:id/:rateid/:type", AllEventsController.removeRate);

router.patch("/archiveEvent/:id/:type", AllEventsController.archiveEvent);
router.patch("/unArchiveEvent/:id/:type", AllEventsController.unArchiveEvent);
router.get("/getArchivedEvents", AllEventsController.getArchivedEvents);
export default router;
