import User from "../models/User.js";
import Admin from "../models/Admin.js";
import EventsOffice from "../models/EventsOffice.js";
import Vendor from "../models/Vendor.js";
import jwt from "jsonwebtoken";
import { sendResetPasswordEmail } from "../utils/mailer.js";
import bcrypt from "bcryptjs";
const getAllUsers = async (_req, res, next) => {
  try {
    const users = await User.find();
    const admins = await Admin.find();
    const eventsOffices = await EventsOffice.find();
    const vendors = await Vendor.find();
    users.push(...admins, ...eventsOffices, ...vendors);
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
    const userId = req.params.id;
    if (!userId)
      return res.status(401).json({ message: "Authentication required" });
    let user = await User.findById(userId);
    if (!user) {
      user = await Admin.findById(userId);
    }
    if (!user) {
      user = await EventsOffice.findById(userId);
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const notificationId = req.params.notifId;
    user.notifications = user.notifications.map((n) =>
      n._id.toString() === notificationId ? { ...n, isRead: true } : n
    );
    await user.save();
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  const userId = req.params.id;
  const notificationId = req.params.notificationId;
  try {
    if (!userId)
      return res.status(401).json({ message: "Authentication required" });
    let user = await User.findById(userId);
    if (!user) {
      user = await Admin.findById(userId);
    }
    if (!user) {
      user = await EventsOffice.findById(userId);
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.notifications = user.notifications.filter(
      (n) => n._id.toString() !== notificationId
    );
    await user.save();
    res.json({ message: "Notification deleted successfully" });
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
    const active = user.status === "Active";
    if (!active) {
      return res
        .status(403)
        .json({ message: "Account is not active. Contact support." });
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

const blockUser = async (req, res, next) => {
  try {
    const { id, role } = req.params;

    let body = { status: "Blocked" };
    let user;
    switch (role) {
      case "Student":
      case "TA":
      case "Professor":
      case "Staff":
        user = await User.findByIdAndUpdate(id, body, { new: true });
        break;
      case "Admin":
        user = await Admin.findByIdAndUpdate(id, body, { new: true });
        break;
      case "Vendor":
        user = await Vendor.findByIdAndUpdate(id, body, { new: true });
        break;
      case "Event office":
        user = await EventsOffice.findByIdAndUpdate(id, body, { new: true });
        break;
    }

    res.status(200).json({ message: "User is Blocked", user });
  } catch (error) {
    next(error);
  }
};
const unBlockUser = async (req, res, next) => {
  try {
    const { id, role } = req.params;
    let body = { status: "Active" };
    let user;
    switch (role) {
      case "Student":
      case "TA":
      case "Professor":
      case "Staff":
        user = await User.findByIdAndUpdate(id, body, { new: true });
        break;
      case "Admin":
        user = await Admin.findByIdAndUpdate(id, body, { new: true });
        break;
      case "Vendor":
        user = await Vendor.findByIdAndUpdate(id, body, { new: true });
        break;
      case "Event office":
        user = await EventsOffice.findByIdAndUpdate(id, body, { new: true });
        break;
    }
    res.status(200).json({ message: "User is Active", user });
  } catch (error) {
    next(error);
  }
};
const passwordEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    let checkMail = await User.findOne({ email: email });
    let role = "User";
    if (!checkMail) {
      checkMail = await Admin.findOne({ email: email });
      role = "Admin";
    }
    if (!checkMail) {
      checkMail = await Vendor.findOne({ email: email });
      role = "Vendor";
    }
    if (!checkMail) {
      checkMail = await EventsOffice.findOne({ email: email });
      role = "EventsOffice";
    }
    if (!checkMail) {
      console.log("HENA");
      return res.status(404).json({ message: "Email is invalid" });
    }
    let id = checkMail._id;
    let token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
      expiresIn: 300,
    });
    await sendResetPasswordEmail(checkMail.email);
    return res.json({
      message: "Reset link has been sent to your email",
      resetToken: token,
    });
  } catch (error) {
    next(error);
  }
};

const forgetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const authHeader = req.headers.authorization || null;
    console.log(req.headers.authorization);
    const [, resetToken] = authHeader.split(" "); // "Bearer <token>"
    if (!resetToken) return res.status(401).json({ message: "Missing token" });

    let decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    let id = decoded.id;
    let role = decoded.role;
    if (!id || !role) {
      return res.status(403).json({ message: "Invalid Token" });
    }
    let salt = await bcrypt.genSalt();
    let hashedPassword = await bcrypt.hash(password, salt);
    let model;
    switch (role) {
      case "Admin":
        model = Admin;
        break;
      case "User":
        model = User;
        break;
      case "Vendor":
        model = Vendor;
        break;
      case "EventsOffice":
        model = EventsOffice;
        break;
    }
    await model.findByIdAndUpdate(id, { password: hashedPassword });
    return res
      .status(200)
      .json({ message: "Yout password has been reseted successfully" });
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
  deleteNotification,
  getAllAdminsAndOfficers,
  loginUser,
  blockUser,
  unBlockUser,
  passwordEmail,
  forgetPassword,
};
