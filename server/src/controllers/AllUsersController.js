import User from "../models/User.js";
import Admin from "../models/Admin.js";
import EventsOffice from "../models/EventsOffice.js";
import Vendor from "../models/Vendor.js";
import { get } from "mongoose";
const getAllUsers = async (_req, res, next) => {
  try {
    const users = await User.find();
    const admins = await Admin.find();
    const eventsOffices = await EventsOffice.find();
    const vendors = await Vendor.find();
    users.push(...admins, ...eventsOffices, ...vendors, ...users);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getAllAdminsAndOfficers = async (_req, res, next) => {
  try {
    const result = [];
    const admins = await Admin.find();
    const eventsOffices = await EventsOffice.find();
    result.push(...admins, ...eventsOffices);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      user = await Admin.findOne({ email });
    }
    if (!user) {
      user = await EventsOffice.findOne({ email });
    }
    if (!user) {
      user = await Vendor.findOne({ email });
    }
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

export default { getAllUsers, getAllAdminsAndOfficers, loginUser };
