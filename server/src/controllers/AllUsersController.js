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

export default { getAllUsers, getAllAdminsAndOfficers };
