import { get } from "mongoose";
import EventsOffice from "../models/EventsOffice.js";
import Joi from "joi";

// vlidation schemas
const eventsOfficeSchema = Joi.object({
  firstname: Joi.string().min(3).max(13).required(),
  lastname: Joi.string().min(3).max(13).required(),
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
  role: Joi.string().default("Event office"),
  status: Joi.string().valid("Active", "Blocked").default("Active"),
  notifications: Joi.array().default([]),
  password: Joi.string().min(6).required(),
});

// createEventOffice
const createEventOffice = async (req, res, next) => {
  try {
    const { value, error } = eventsOfficeSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const doc = await EventsOffice.create(value);
    return res.json({ eventoffice: doc });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Please insert a unique id" });
    }
    next(err);
  }
};
// login
const eventOfficeLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const eventOffice = await EventsOffice.findOne({ email });
    if (!eventOffice) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const flag = await eventOffice.validatePassword(password);
    if (!flag) {
      return res.status(400).json({ message: "Invalid password" });
    }
    return res.json({ message: "Login successful", eventOffice });
  } catch (error) {
    next(error);
  }
};

const getEventsOffice = async (req, res, next) => {
  try {
    const eventsOffice = await EventsOffice.find(
      {},
      { password: 0, __v: 0, notifications: 0 }
    );
    res.json({ eventsOffice });
  } catch (error) {
    next(error);
  }
};

const deleteEventOffice = async (req, res, next) => {
  try {
    const { id } = req.params;
    await EventsOffice.findByIdAndDelete(id);
    res.json({ message: "Event office deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getEventOffice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventOffice = await EventsOffice.findById(
      { _id: id },
      { password: 0, __v: 0, notifications: 0 }
    );
    if (!eventOffice) {
      return res.status(404).json({ message: "Event office not found" });
    }
    return res.json({ eventOffice });
  } catch (error) {
    next(error);
  }
};
export default {
  createEventOffice,
  eventOfficeLogin,
  getEventsOffice,
  deleteEventOffice,
  getEventOffice,
};
