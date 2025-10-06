import User from "../models/User.js";
import RegisterRequest from "./registerRequestController.js";
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
    if (value.email.includes("student")) {
      value.role = "Student";
      value.status = "Active";
      doc = await User.create(value);
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
    if (err.code === 11000) {
      return res.status(409).json({ message: "Please insert a unique id" });
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
    const users = await User.find();
    return res.json({ users });
  } catch (error) {
    next(error);
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

const updateUser = async (req, res, next) => {
  try {
  } catch (error) {}
};
export default { signup, loginUser, getUsers, deleteUser };
