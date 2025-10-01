import GymSession from "../models/GymSession.js";
import Student from "../models/Student.js";

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
  const session = await GymSession.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json(session);
};

// Delete session
export const deleteSession = async (req, res) => {
  await GymSession.findByIdAndDelete(req.params.id);
  res.json({ message: "Session deleted" });
};

// Register a student
export const registerStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
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

// Unregister a student
export const unregisterStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
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
