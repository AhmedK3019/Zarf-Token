import User from "../models/User.js";
import Joi from "joi";

// vlidation schemas
const userSchema = Joi.object({
  firstname: Joi.string().min(3).max(8).required(),
  lastname: Joi.string().min(3).max(8).required(),
  gucId: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().allow("").valid("Staff", "TA", "Professor", "Student"),
  password: Joi.string().min(6).required(),
});

// createUser
const signup = async (req, res, next) => {
  try {
    const { value, error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
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
