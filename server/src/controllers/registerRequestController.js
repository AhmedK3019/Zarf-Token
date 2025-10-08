import RegisterRequest from "../models/RegisterRequest.js";
import User from "../models/User.js";
import Joi from "joi";
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

export default {
  createRegisterRequest,
  getAllRegisterRequests,
  deleteRegisterRequest,
  updateRegisterRequest,
};
