import mongoose from "mongoose";
import GymSession from "../models/GymSession.js";
import User from "../models/User.js";
import EventsOffice from "../models/EventsOffice.js";
import { sendEmail } from "../utils/mailer.js";
// Create new session
export const createSession = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user is Events Office
    const eventsOfficeUser = await EventsOffice.findById(userId);
    const regularUser = await User.findById(userId);
    const isEventsOffice =
      eventsOfficeUser ||
      (regularUser &&
        (regularUser.role === "Events Office" ||
          regularUser.role === "Event office"));

    if (!isEventsOffice) {
      return res.status(403).json({
        error: "Access denied. Only Events Office can create gym sessions.",
      });
    }

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
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user is Events Office
    const eventsOfficeUser = await EventsOffice.findById(userId);
    const regularUser = await User.findById(userId);
    const isEventsOffice =
      eventsOfficeUser ||
      (regularUser &&
        (regularUser.role === "Events Office" ||
          regularUser.role === "Event office"));

    if (!isEventsOffice) {
      return res.status(403).json({
        error: "Access denied. Only Events Office can update gym sessions.",
      });
    }

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
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user is Events Office
    const eventsOfficeUser = await EventsOffice.findById(userId);
    const regularUser = await User.findById(userId);
    const isEventsOffice =
      eventsOfficeUser ||
      (regularUser &&
        (regularUser.role === "Events Office" ||
          regularUser.role === "Event office"));

    if (!isEventsOffice) {
      return res.status(403).json({
        error: "Access denied. Only Events Office can delete gym sessions.",
      });
    }

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

// Register a user (Student, Staff, Events Office, TA, Professor)
export const registerUser = async (req, res) => {
  try {
    const userId =
      req.userId || req.user?._id || req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const session = await GymSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    // Convert string userId to ObjectId for proper comparison
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if already registered using ObjectId comparison
    const alreadyRegistered = session.registered.some((id) =>
      id.equals(userObjectId)
    );
    if (alreadyRegistered) {
      return res.status(400).json({ error: "Already registered" });
    }

    if (session.registered.length >= session.maxParticipants) {
      return res.status(400).json({ error: "Session is full" });
    }

    // Check if user exists (could be in User or EventsOffice collection)
    const regularUser = await User.findById(userObjectId);
    const eventsOfficeUser = await EventsOffice.findById(userObjectId);

    if (!regularUser && !eventsOfficeUser) {
      return res.status(404).json({ error: "User not found" });
    }

    session.registered.push(userObjectId);
    await session.save();

    // Get the updated session and manually populate registered users from both collections
    const updatedSession = await GymSession.findById(session._id);
    const populatedRegistered = [];

    for (const userId of updatedSession.registered) {
      // Try to find in User collection first
      let user = await User.findById(userId, "email firstname lastname role");

      // If not found in User, try EventsOffice collection
      if (!user) {
        user = await EventsOffice.findById(
          userId,
          "email firstname lastname role"
        );
      }

      if (user) {
        populatedRegistered.push(user);
      }
    }

    // Create response object with manually populated data
    const responseSession = {
      ...updatedSession.toObject(),
      registered: populatedRegistered,
    };

    res.json(responseSession);
  } catch (err) {
    console.error("Registration error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const getSessionsByMonth = async (req, res) => {
  try {
    const { month } = req.params; // expect format YYYY-MM
    const [year, monthNum] = month.split("-");

    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);

    const sessions = await GymSession.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    // Manually populate registered users from both User and EventsOffice collections
    const populatedSessions = [];

    for (const session of sessions) {
      const populatedRegistered = [];

      for (const userId of session.registered) {
        // Try to find in User collection first
        let user = await User.findById(userId, "email firstname lastname role");

        // If not found in User, try EventsOffice collection
        if (!user) {
          user = await EventsOffice.findById(
            userId,
            "email firstname lastname role"
          );
        }

        if (user) {
          populatedRegistered.push(user);
        }
      }

      // Create session object with manually populated data
      const populatedSession = {
        ...session.toObject(),
        registered: populatedRegistered,
      };

      populatedSessions.push(populatedSession);
    }

    res.json(populatedSessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Unregister a user (Student, Staff, Events Office, TA, Professor)
export const unregisterUser = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id; // Get from auth middleware
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const session = await GymSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    // Convert string userId to ObjectId for proper comparison
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Filter out the user's ObjectId
    const initialCount = session.registered.length;
    session.registered = session.registered.filter(
      (id) => !id.equals(userObjectId)
    );

    if (session.registered.length === initialCount) {
      return res
        .status(400)
        .json({ error: "You are not registered for this session" });
    }

    await session.save();

    // Get the updated session and manually populate registered users from both collections
    const updatedSession = await GymSession.findById(session._id);
    const populatedRegistered = [];

    for (const userId of updatedSession.registered) {
      // Try to find in User collection first
      let user = await User.findById(userId, "email firstname lastname role");

      // If not found in User, try EventsOffice collection
      if (!user) {
        user = await EventsOffice.findById(
          userId,
          "email firstname lastname role"
        );
      }

      if (user) {
        populatedRegistered.push(user);
      }
    }

    // Create response object with manually populated data
    const responseSession = {
      ...updatedSession.toObject(),
      registered: populatedRegistered,
    };

    res.json(responseSession);
  } catch (err) {
    console.error("Unregistration error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Delete all gym sessions for a specific month
export const deleteMonthSessions = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user is Events Office
    const eventsOfficeUser = await EventsOffice.findById(userId);
    const regularUser = await User.findById(userId);
    const isEventsOffice =
      eventsOfficeUser ||
      (regularUser &&
        (regularUser.role === "Events Office" ||
          regularUser.role === "Event office"));

    if (!isEventsOffice) {
      return res.status(403).json({
        error: "Access denied. Only Events Office can delete all sessions.",
      });
    }

    const { month } = req.params; // Format: YYYY-MM
    const [year, monthNum] = month.split("-");

    if (!year || !monthNum) {
      return res.status(400).json({
        error: "Invalid month format. Use YYYY-MM (e.g., 2025-10)",
      });
    }

    const startDate = new Date(
      Date.UTC(parseInt(year), parseInt(monthNum) - 1, 1)
    );
    const endDate = new Date(Date.UTC(parseInt(year), parseInt(monthNum), 1));

    const deleteResult = await GymSession.deleteMany({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    res.json({
      message: `Deleted ${deleteResult.deletedCount} sessions for ${month}`,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
