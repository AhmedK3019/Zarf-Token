import Reservation from "../models/Reservation.js";
import { Court } from "../models/Court.js";

// Create reservation
export const createReservation = async (req, res) => {
  try {
    const reservation = new Reservation(req.body);
    await reservation.save();
    res.status(201).json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all reservations
export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate("courtId studentId");
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get reservations by studentId
export const getReservationsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const reservations = await Reservation.find({ studentId }).populate(
      "courtId"
    );
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel reservation
export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation)
      return res.status(404).json({ error: "Reservation not found" });

    // Free the court slot if it exists
    const court = await Court.findById(reservation.courtId);
    if (court) {
      const slot = court.freeSlots.find(
        (s) => s.dateTime.getTime() === reservation.dateTime.getTime()
      );
      if (slot) {
        slot.isReserved = false;
        slot.reservationId = null;
        await court.save();
      }
    }

    await reservation.deleteOne();

    res.json({ message: "Reservation cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
