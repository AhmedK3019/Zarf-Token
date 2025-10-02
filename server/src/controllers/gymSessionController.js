import GymSession from "../models/GymSession.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/mailer.js";

// Create new session
export const createSession = async (req, res) => {
  try {
    const session = new GymSession(req.body);
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all sessions
export const getSessions = async (req, res) => {
  const sessions = await GymSession.find().populate("registered");
  res.json(sessions);
};

// Get session by ID
export const getSessionById = async (req, res) => {
  const session = await GymSession.findById(req.params.id).populate(
    "registered"
  );
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json(session);
};

// Update session info
export const updateSession = async (req, res) => {
  try {
    const session = await GymSession.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    ).populate("registered", "email"); // get emails

    if (!session) return res.status(404).json({ error: "Session not found" });

    // Notify all registered users
    const emails = session.registered.map((u) => u.email);
    for (const email of emails) {
      await sendEmail(
        email,
        "Gym Session Updated",
        `The gym session on ${session.date} at ${session.time} has been updated. Please check the app for details.`
      );
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete session
export const deleteSession = async (req, res) => {
  try {
    const session = await GymSession.findById(req.params.id).populate(
      "registered",
      "email"
    );

    if (!session) return res.status(404).json({ error: "Session not found" });

    // Notify before deletion
    const emails = session.registered.map((u) => u.email);
    for (const email of emails) {
      await sendEmail(
        email,
        "Gym Session Cancelled",
        `The gym session on ${session.date} at ${session.time} has been cancelled.`
      );
    }

    await GymSession.findByIdAndDelete(req.params.id);

    res.json({ message: "Session deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Register a student
export const registerStudent = async (req, res) => {
  try {
    const { studentId } = req.body.user._id;
    const session = await GymSession.findById(req.params.id);

    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.registered.includes(studentId)) {
      return res.status(400).json({ error: "Already registered" });
    }
    if (session.registered.length >= session.maxParticipants) {
      return res.status(400).json({ error: "Session is full" });
    }

    session.registered.push(studentId);
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getSessionsByMonth = async (req, res) => {
  try {
    const { month } = req.params.month; // pass month number (1-12)
    const sessions = await GymSession.find({
      $expr: { $eq: [{ $month: "$date" }, parseInt(month)] },
    });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Unregister a student
export const unregisterStudent = async (req, res) => {
  try {
    const { studentId } = req.body.user._id;
    const session = await GymSession.findById(req.params.id);

    if (!session) return res.status(404).json({ error: "Session not found" });

    session.registered = session.registered.filter(
      (id) => id.toString() !== studentId
    );

    await session.save();
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
