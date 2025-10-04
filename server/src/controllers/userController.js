import User from "../models/User.js";
import RegisterRequest from "../models/RegisterRequest.js";
import Joi from "joi";

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
  password: Joi.string().min(6).required(),
});

// createUser
const signup = async (req, res, next) => {
  try {
    const { value, error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    if (value.email.includes("student")) value.role = "Student";
    if (value.role == "Not Specified")
      await RegisterRequest.create({
        firstname: value.firstname,
        lastname: value.lastname,
        gucid: value.gucid,
        email: value.email,
        role: value.role,
      });
    const doc = await User.create(value);
    return res.json({ user: doc });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Please insert a unique id" });
    }
    next(err);
  }
};
// login

export default { signup };
