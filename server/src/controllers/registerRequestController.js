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
    const user = await User.create({
      firstname: request.firstname,
      lastname: request.lastname,
      gucid: request.gucid,
      email: request.email,
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
