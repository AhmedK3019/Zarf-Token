import User from "../models/User.js";
import RegisterRequest from "./registerRequestController.js";
import Joi from "joi";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/mailer.js";
import { resolveFavourites } from "../utils/favourites.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// vlidation schemas
const userSchema = Joi.object({
  firstname: Joi.string().min(3).max(13).required(),
  lastname: Joi.string().min(3).max(13).required(),
  gucid: Joi.string().required(),
  email: Joi.string()
    .email()
    .required()
    .pattern(
      /^[a-zA-Z0-9._%+-]+(\.[a-zA-Z0-9._%+-]+)*@([a-zA-Z0-9-]+\.)*guc\.edu\.eg$/i
    )
    .messages({
      "string.pattern.base":
        "Email must be a valid GUC email (ending with .guc.edu.eg)",
    }),
  role: Joi.string()
    .allow("")
    .valid("Staff", "TA", "Professor", "Student", "Not Specified")
    .default("Not Specified"),
  status: Joi.string().valid("Active", "Blocked").default("Blocked"),
  notifications: Joi.array().default([]),
  password: Joi.string().min(6).required(),
});

// createUser
const signup = async (req, res, next) => {
  try {
    let doc;
    const { value, error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    // normalize identifiers to reduce accidental duplicates
    if (value.gucid && typeof value.gucid === "string")
      value.gucid = value.gucid.trim();
    if (value.email && typeof value.email === "string")
      value.email = value.email.trim().toLowerCase();

    // prevent obvious duplicate user creation by checking existing User first
    try {
      const existing = await User.findOne({
        $or: [{ gucid: value.gucid }, { email: value.email }],
      });
      if (existing) {
        // indicate which field conflicts when possible
        const conflict = {};
        if (existing.gucid === value.gucid) conflict.gucid = value.gucid;
        if (existing.email === value.email) conflict.email = value.email;
        return res
          .status(409)
          .json({ message: "GUC ID or email already registered", conflict });
      }
    } catch (findErr) {
      // non-fatal: log and continue to let create() surface any issues
      console.error("Error checking existing user:", findErr);
    }
    if (value.email.includes("student")) {
      value.role = "Student";
      // initially blocked until email verification
      value.status = "Blocked";
      doc = await User.create(value);

      // create a verification token and send email with verify link
      try {
        const token = jwt.sign({ userId: doc._id }, JWT_SECRET, {
          expiresIn: "1d",
        });
        const verifyUrl = `${BACKEND_URL}/api/auth/verify-email?token=${token}`;
        const subject = "Verify your GUC account";
        const text = `Hello ${doc.firstname},\n\nPlease verify your account by clicking the link below:\n\n${verifyUrl}\n\nThis link will redirect you to the login page after verification.`;
        await sendEmail(doc.email, subject, text);
      } catch (emailErr) {
        // if email fails, remove created user to avoid unverified leftovers
        await User.findByIdAndDelete(doc._id);
        console.error("Error sending verification email:", emailErr);
        return res
          .status(500)
          .json({ message: "Failed to send verification email" });
      }
    }
    if (value.role == "Not Specified")
      doc = await RegisterRequest.createRegisterRequest({
        firstname: value.firstname,
        lastname: value.lastname,
        gucid: value.gucid,
        email: value.email,
        role: value.role,
        status: value.status,
        password: value.password,
      });

    return res.json({ user: doc });
  } catch (err) {
    // Duplicate key from MongoDB (unique index) — provide details
    if (err && err.code === 11000) {
      // err.keyValue usually holds the offending field/value
      console.error(
        "Duplicate key error creating user:",
        err.keyValue || err.message
      );
      return res.status(409).json({
        message: "Duplicate key error",
        details: err.keyValue || err.message,
      });
    }
    next(err);
  }
};
// login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const flag = await user.validatePassword(password);
    if (!flag) {
      return res.status(400).json({ message: "Invalid password" });
    }
    return res.json({ message: "Login successful", user });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find(
      {},
      { password: 0, __v: 0, notifications: 0 }
    );
    return res.json({ users });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(
      { _id: id },
      {
        password: 0,
        __v: 0,
        notifications: 0,
      }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Add favourite (req.params.id = userId)
const addFavourite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { itemType, itemId } = req.body;
    if (!itemType || !itemId)
      return res.status(400).json({ message: "itemType and itemId required" });

    const updated = await User.findByIdAndUpdate(
      id,
      { $addToSet: { favouriteEvents: { itemType, itemId } } },
      { new: true }
    ).select("-password -__v");

    if (!updated) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "Added", user: updated });
  } catch (err) {
    next(err);
  }
};

const getUserFavourites = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id, { favouriteEvents: 1 });
    if (!user) return res.status(404).json({ message: "User not found" });
    const resolved = await resolveFavourites(user.favouriteEvents || []);

    return res.json({ favourites: resolved });
  } catch (err) {
    next(err);
  }
};

const removeFavourite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { itemType, itemId } = req.body;
    if (!itemType || !itemId)
      return res.status(400).json({ message: "itemType and itemId required" });

    const updated = await User.findByIdAndUpdate(
      id,
      { $pull: { favouriteEvents: { itemType, itemId } } },
      { new: true }
    ).select("-password -__v");

    if (!updated) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "Removed", user: updated });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getProfessors = async (_req, res, next) => {
  try {
    const profs = await User.find(
      { role: "Professor" },
      { firstname: 1, lastname: 1 }
    );
    return res.status(200).json(profs);
  } catch (error) {
    next(error);
  }
};
export default {
  signup,
  loginUser,
  getUsers,
  addFavourite,
  removeFavourite,
  getUserFavourites,
  deleteUser,
  getProfessors,
  getUser,
};
