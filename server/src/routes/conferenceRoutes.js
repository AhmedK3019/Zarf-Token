import conferenceController from "../controllers/conferenceController.js";
import express from "express";
const router = express.Router();

router.post("/createConference", conferenceController.createConference);
router.get("/getAllConferences", conferenceController.getAllConferences);
router.get("/getConference/:id", conferenceController.getConferenceById);
router.put("/updateConference/:id", conferenceController.updateConference);
router.delete("/deleteConference/:id", conferenceController.deleteConference);

export default router;
