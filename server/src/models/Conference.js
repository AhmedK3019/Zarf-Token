import mongoose from "mongoose";
import User from "../models/User.js";
import EventsOffice from "../models/EventsOffice.js";
const conferenceSchema = new mongoose.Schema({
  conferencename: { type: String, required: true },
  professorname: { type: String, required: true },
  startdate: { type: Date, required: true },
  starttime: { type: String, required: true },
  enddate: { type: Date, required: true },
  endtime: { type: String, required: true },
  shortdescription: { type: String, required: true },
  location: { type: String, required: true },
  fullagenda: { type: String, required: true },
  conferencelink: { type: String, required: true },
  requiredbudget: { type: Number, required: true },
  sourceoffunding: { type: String, enum: ["External", "GUC"], required: true },
  extrarequiredresources: { type: String },
  ratings: {
    type: [
      {
        rating: { type: Number, enum: [0, 1, 2, 3, 4, 5], default: 0 },

        userId: { type: mongoose.Schema.ObjectId, ref: "User" },
      },
    ],
    default: [],
  },
  userComments: {
    type: [
      {
        comment: { type: String },

        userId: { type: mongoose.Schema.ObjectId, ref: "User" },
      },
    ],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, default: "conference" },
  archive: { type: Boolean, default: false },
  allowedusers: [
    {
      type: String,
      enum: ["Student", "Professor", "TA", "Staff", "Admin", "Event office"],
    },
  ],
});
conferenceSchema.pre("save", function (next) {
  // Ensure allowedusers is an array
  if (!Array.isArray(this.allowedusers)) {
    this.allowedusers = [];
  }

  // Add required roles if missing
  const requiredRoles = ["Admin", "Event office"];

  requiredRoles.forEach((role) => {
    if (!this.allowedusers.includes(role)) {
      this.allowedusers.push(role);
    }
  });

  next();
});
conferenceSchema.post("save", async function (doc, next) {
  try {
    const message = `Check out ${doc.conferencename} — a new conference has been created!`;
    const roles = doc.allowedusers;
    await User.updateMany(
      { role: { $in: roles } },
      { $push: { notifications: { message } } }
    );
    await EventsOffice.updateMany(
      {},
      { $push: { notifications: { message } } }
    );
    next();
  } catch (error) {
    next(error);
  }
});

const Conference = mongoose.model("Conference", conferenceSchema);
export default Conference;
