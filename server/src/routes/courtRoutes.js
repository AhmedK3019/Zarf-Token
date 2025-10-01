import express from "express";
import {
  createCourt,
  getCourts,
  getCourtById,
  updateCourt,
  deleteCourt,
  reserveCourt,
} from "../controllers/courtController.js";

const router = express.Router();

router.post("/", createCourt);
router.get("/", getCourts);
router.get("/:id", getCourtById);
router.put("/:id", updateCourt);
router.delete("/:id", deleteCourt);

// Reserve a court (expects { reservationId } in body)
router.post("/:id/reserve", reserveCourt);

export default router;
