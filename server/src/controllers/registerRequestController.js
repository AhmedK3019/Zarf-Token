import RegisterRequest from "../models/RegisterRequest.js";
import User from "../models/User.js";
import Joi from "joi";
import jwt from "jsonwebtoken";
const userSchema = Joi.object({
  role: Joi.string().valid("Staff", "TA", "Professor"),
});
// createRegisterRequest
const createRegisterRequest = async (body) => {
  try {
    const doc = await RegisterRequest.create(body);
    return doc;
  } catch (err) {
    throw err;
  }
};

const getAllRegisterRequests = async (req, res, next) => {
  try {
    const requests = await RegisterRequest.find();
    return res.json({ requests });
  } catch (error) {
    next(error);
  }
};
const deleteRegisterRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    await RegisterRequest.findByIdAndDelete(id);
    return res.json({ message: "Register request deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const updateRegisterRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const request = await RegisterRequest.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );
    const { value, error } = userSchema.validate({
      role: request.role,
    });
    if (error) return res.status(400).json({ message: error.message });
    // normalize
    const gucid =
      request.gucid && typeof request.gucid === "string"
        ? request.gucid.trim()
        : request.gucid;
    const email =
      request.email && typeof request.email === "string"
        ? request.email.trim().toLowerCase()
        : request.email;

    // check existing user to avoid duplicate key error
    const existing = await User.findOne({ $or: [{ gucid }, { email }] });
    if (existing) {
      const conflict = {};
      if (existing.gucid === gucid) conflict.gucid = gucid;
      if (existing.email === email) conflict.email = email;
      return res
        .status(409)
        .json({ message: "GUC ID or email already registered", conflict });
    }

    const user = await User.create({
      firstname: request.firstname,
      lastname: request.lastname,
      gucid,
      email,
      role: value.role,
      status: request.status,
      password: request.password,
    });
    return res.json({ request, user });
  } catch (error) {
    next(error);
  }
};

const setRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    // Validate role
    const { value, error } = userSchema.validate({ role });
    if (error) return res.status(400).json({ message: error.message });

    // Find the register request
    const request = await RegisterRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Normalize identifiers
    const gucid =
      request.gucid && typeof request.gucid === "string"
        ? request.gucid.trim()
        : request.gucid;
    const email =
      request.email && typeof request.email === "string"
        ? request.email.trim().toLowerCase()
        : request.email;

    // Check for existing user to avoid duplicates
    const existing = await User.findOne({ $or: [{ gucid }, { email }] });
    if (existing) {
      const conflict = {};
      if (existing.gucid === gucid) conflict.gucid = gucid;
      if (existing.email === email) conflict.email = email;
      return res
        .status(409)
        .json({ message: "GUC ID or email already registered", conflict });
    }

    // Create the user (initially blocked until verification)
    const newUser = await User.create({
      firstname: request.firstname,
      lastname: request.lastname,
      gucid,
      email,
      role: value.role,
      status: "Blocked",
      password: request.password,
    });

    // Send verification email (reuse existing pattern)
    try {
      const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
      const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
      const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
        expiresIn: "1d",
      });
      const verifyUrl = `${BACKEND_URL}/api/auth/verify-email?token=${token}`;
      const subject = "Verify your GUC account";
      const text = `Hello ${newUser.firstname},\n\nPlease verify your account by clicking the link below:\n\n${verifyUrl}\n\nThis link will redirect you to the login page after verification.`;
      const { sendEmail } = await import("../utils/mailer.js");
      await sendEmail(newUser.email, subject, text);
    } catch (emailErr) {
      // On email failure remove created user and inform caller
      await User.findByIdAndDelete(newUser._id);
      console.error(
        "Error sending verification email for register request:",
        emailErr && emailErr.message ? emailErr.message : emailErr
      );
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }

    // Delete the register request now that user was created and email was sent
    await RegisterRequest.findByIdAndDelete(id);

    return res.json({
      message: "User created and verification email sent",
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createRegisterRequest,
  getAllRegisterRequests,
  deleteRegisterRequest,
  updateRegisterRequest,
  setRole,
};
