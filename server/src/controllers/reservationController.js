import Reservation from "../models/Reservation.js";

export const createReservation = async (req, res) => {
  try {
    const reservation = new Reservation(req.body);
    await reservation.save();
    res.status(201).json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getReservations = async (req, res) => {
  const reservations = await Reservation.find().populate("courtId studentId");
  res.json(reservations);
};
