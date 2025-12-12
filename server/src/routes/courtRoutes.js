import express from "express";
import {
  createCourt,
  getCourts,
  getCourtById,
  updateCourt,
  deleteCourt,
  reserveCourt,
  getUserReservations,
  cancelReservation,
} from "../controllers/courtController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", upload.single("image"), createCourt);
router.get("/", getCourts);
router.get("/:id", getCourtById);
router.put("/:id", upload.single("image"), updateCourt);
router.delete("/:id", deleteCourt);

// Reserve a court (expects { reservationId } in body)
router.post("/:id/reserve", reserveCourt);

router.get("/my-reservations/:userId", getUserReservations);

router.delete("/:id/cancel-reservation", cancelReservation);

export default router;
