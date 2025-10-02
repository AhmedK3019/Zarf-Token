import express from "express";
import {
  createReservation,
  getReservations,
  getReservationsByStudent,
  cancelReservation,
} from "../controllers/reservationController.js";

const router = express.Router();

router.post("/", createReservation); // create a reservation
router.get("/", getReservations); // get all reservations
router.get("/student/:studentId", getReservationsByStudent); // get reservations for a student
router.delete("/:id", cancelReservation); // cancel reservation

export default router;
