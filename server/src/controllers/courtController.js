import { Court } from "../models/Court.js";
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
  const courts = await Court.find();
  res.json(courts);
};

// Get court by ID
export const getCourtById = async (req, res) => {
  const court = await Court.findById(req.params.id);
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
  try {
    const court = await Court.findById(req.params.id);
    if (!court) return res.status(404).json({ error: "Court not found" });

    // Only delete future reservations (keep past reservations for historical records)
    const now = new Date();
    const deleteResult = await Reservation.deleteMany({ 
      courtId: court._id,
      dateTime: { $gte: now }
    });

    // delete the court itself
    await court.deleteOne();

    res.json({ 
      message: "Court deleted successfully", 
      futureReservationsCancelled: deleteResult.deletedCount 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const reserveCourt = async (req, res) => {
  try {
    const { courtId, studentId, studentName, studentGucId, dateTime } =
      req.body;

    const court = await Court.findById(courtId);
    if (!court) return res.status(404).json({ error: "Court not found" });

    // Find slot
    const slot = court.freeSlots.find(
      (s) => s.dateTime.getTime() === new Date(dateTime).getTime()
    );
    if (!slot)
      return res.status(400).json({ error: "Requested time not available" });
    if (slot.isReserved)
      return res.status(400).json({ error: "Slot already reserved" });

    // Create reservation
    const reservation = new Reservation({
      courtId,
      studentId,
      studentName,
      studentGucId,
      dateTime,
    });
    await reservation.save();

    // Reserve slot
    slot.isReserved = true;
    slot.reservationId = reservation._id;

    await court.save();

    res.status(201).json({ court, reservation });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUserReservations = async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Reservation.find({ studentId: userId }).populate('courtId');
    const formattedReservations = reservations.map(reservation => {
      // Handle case where court was deleted (courtId is null after populate fails)
      if (!reservation.courtId) {
        return {
          _id: reservation._id,
          slotId: reservation._id,
          courtId: null,
          courtName: "Court No Longer Available",
          courtType: "deleted",
          dateTime: reservation.dateTime,
          studentName: reservation.studentName,
          studentGucId: reservation.studentGucId,
          isCourtDeleted: true,
        };
      }
      
      return {
        _id: reservation._id,
        slotId: reservation._id,
        courtId: reservation.courtId._id,
        courtName: reservation.courtId.name,
        courtType: reservation.courtId.type,
        dateTime: reservation.dateTime,
        studentName: reservation.studentName,
        studentGucId: reservation.studentGucId,
        isCourtDeleted: false,
      };
    });
    
    res.json(formattedReservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel a reservation
export const cancelReservation = async (req, res) => {
  try {
    const { id: courtId } = req.params;
    const { studentId, slotId } = req.body;
    const reservation = await Reservation.findById(slotId);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    if (reservation.studentId.toString() !== studentId) {
      return res.status(403).json({ error: "Unauthorized to cancel this reservation" });
    }
    const court = await Court.findById(courtId);
    if (court) {
      const slot = court.freeSlots.find(s => 
        s.reservationId && s.reservationId.toString() === slotId
      );
      if (slot) {
        slot.isReserved = false;
        slot.reservationId = null;
        await court.save();
      }
    }
    await Reservation.findByIdAndDelete(slotId);
    
    res.json({ message: "Reservation cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
