import Court from "../models/Court.js";
import Reservation from "../models/Reservation.js";

// Create a new court
export const createCourt = async (req, res) => {
  try {
    const court = new Court(req.body);
    await court.save();
    res.status(201).json(court);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all courts
export const getCourts = async (req, res) => {
  const courts = await Court.find().populate("reservationId");
  res.json(courts);
};

// Get court by ID
export const getCourtById = async (req, res) => {
  const court = await Court.findById(req.params.id).populate("reservationId");
  if (!court) return res.status(404).json({ error: "Court not found" });
  res.json(court);
};

// Update court info
export const updateCourt = async (req, res) => {
  const court = await Court.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!court) return res.status(404).json({ error: "Court not found" });
  res.json(court);
};

// Delete court
export const deleteCourt = async (req, res) => {
  await Court.findByIdAndDelete(req.params.id);
  res.json({ message: "Court deleted" });
};

export const reserveCourt = async (req, res) => {
  try {
    const { reservationId } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation)
      return res.status(404).json({ error: "Reservation not found" });

    const court = await Court.findById(reservation.courtId);
    if (!court) return res.status(404).json({ error: "Court not found" });

    // Find the matching slot in the court's freeSlots
    const slot = court.freeSlots.find(
      (s) => s.dateTime.getTime() === reservation.dateTime.getTime()
    );

    if (!slot) {
      return res.status(400).json({ error: "Requested time not available" });
    }

    if (slot.isReserved) {
      return res.status(400).json({ error: "Slot already reserved" });
    }

    // Reserve the slot
    slot.isReserved = true;
    slot.reservationId = reservation._id;

    await court.save();

    res.json(court);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
