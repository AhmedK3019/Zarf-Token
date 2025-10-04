import Admin from "../models/Admin.js";
import Joi from "joi";

// vlidation schemas
const adminSchema = Joi.object({
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
  role: Joi.string().default("Admin"),
  password: Joi.string().min(6).required(),
});

// createAdmin
const createAdmin = async (req, res, next) => {
  try {
    const { value, error } = adminSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const doc = await Admin.create(value);
    return res.json({ admin: doc });
  } catch (err) {
    next(err);
  }
};
// login

export default { createAdmin };
