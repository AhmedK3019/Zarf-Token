import mongoose from "mongoose";
import User from "../models/User.js";
import EventsOffice from "../models/EventsOffice.js";
const bazaarSchema = new mongoose.Schema({
  bazaarname: { type: String, required: true },
  startdate: { type: Date, required: true },
  starttime: { type: String, required: true },
  enddate: { type: Date, required: true },
  endtime: { type: String, required: true },
  location: { type: String, required: true },
  shortdescription: { type: String, required: true },
  registrationdeadline: { type: Date, required: true },
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
  type: { type: String, default: "bazaar" },
  vendorParticipationCount: { type: Number, default: 0 },
  revenue: {
    type: mongoose.Schema.Types.Decimal128,
    default: mongoose.Types.Decimal128.fromString("0.00"),
    // getter to return a plain number in JSON output
    get: (v) => {
      return v ? v.toString() : "0.00";
    },
  },
  archive: { type: Boolean, default: false },
  allowedusers: ["Student", "TA", "Professor", "Staff"],
});

bazaarSchema.post("save", async function (doc, next) {
  try {
    const message = `Check out ${doc.bazaarname} — a new bazaar is available!`;
    await User.updateMany({}, { $push: { notifications: { message } } });
    await EventsOffice.updateMany(
      {},
      { $push: { notifications: { message } } }
    );
    next();
  } catch (error) {
    next(error);
  }
});
const Bazaar = mongoose.model("Bazaar", bazaarSchema);
export default Bazaar;
