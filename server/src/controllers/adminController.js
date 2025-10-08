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
  status: Joi.string().valid("Active", "Blocked").default("Active"),
  notifications: Joi.array().default([]),
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

const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const flag = await admin.validatePassword(password);
    if (!flag) {
      return res.status(400).json({ message: "Invalid password" });
    }
    return res.json({ message: "Login successful", admin });
  } catch (error) {
    next(error);
  }
};

const getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find(
      {},
      { password: 0, __v: 0, notifications: 0 }
    );
    res.json({ admins });
  } catch (error) {
    next(error);
  }
};

const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Admin.findByIdAndDelete(id);
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(
      { _id: id },
      { password: 0, __v: 0, notifications: 0 }
    );
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.json({ admin });
  } catch (error) {
    next(error);
  }
};

export default { createAdmin, loginAdmin, getAdmins, deleteAdmin, getAdmin };
