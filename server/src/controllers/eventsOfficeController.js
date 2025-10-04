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

export default { createEventOffice, eventOfficeLogin };
