import tripController from "../controllers/tripController.js";
import express from "express";

const router = express.Router();
router.post("/createTrip", tripController.createTrip);
router.get("/getAllTrips", tripController.getAllTrips);
router.get("/getTrip/:id", tripController.getTrip);
router.put("/updateTrip/:id", tripController.updateTrip);
router.delete("/deleteTrip/:id", tripController.deleteTrip);
router.patch("/registerForaTrip/:id", tripController.registerForTrip);
export default router;
