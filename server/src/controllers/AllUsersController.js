import User from "../models/User.js";
import Admin from "../models/Admin.js";
import EventsOffice from "../models/EventsOffice.js";
import Vendor from "../models/Vendor.js";
import jwt from "jsonwebtoken";
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

const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId);
    if (!user) {
      user = await Admin.findById(userId);
    }
    if (!user) {
      user = await EventsOffice.findById(userId);
    }
    if (!user) {
      user = await Vendor.findById(userId);
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const deleteUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    let user = await User.findByIdAndDelete(userId);
    if (!user) {
      user = await Admin.findByIdAndDelete(userId);
    }
    if (!user) {
      user = await EventsOffice.findByIdAndDelete(userId);
    }
    if (!user) {
      user = await Vendor.findByIdAndDelete(userId);
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const setNotificationRead = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Authentication required" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.notifications = user.notifications.map((n) => ({ ...n, read: true }));
    await user.save();
    res.json({ message: "Notifications marked as read" });
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
    let user = await User.findOne({ email });
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
    const token = createToken(user);

    const userObj =
      typeof user.toObject === "function" ? user.toObject() : { ...user };
    if (userObj.password) delete userObj.password;
    return res.json({ message: "Login successful", user: userObj, token });
  } catch (error) {
    next(error);
  }
};
const createToken = (body) => {
  const payload = {
    id: String(body._id),
    name: body.firstname,
    role: body.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};
export default {
  getAllUsers,
  getUserById,
  deleteUserById,
  setNotificationRead,
  getAllAdminsAndOfficers,
  loginUser,
};
