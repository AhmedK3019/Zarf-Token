import mongoose from "mongoose";
import User from "../models/User.js";
import EventsOffice from "../models/EventsOffice.js";
const peopleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

const boothSchema = new mongoose.Schema(
  {
    boothname: { type: String, required: true },
    vendorRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorRequest",
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    people: {
      type: [peopleSchema],
      validate: [
        (arr) => arr.length >= 1 && arr.length <= 5,
        "People must be between 1 and 5",
      ],
    },
    duration: { type: Number, enum: [1, 2, 3, 4] }, // in weeks
    boothSize: {
      type: String,
      enum: ["2x2", "4x4"],
      required: true,
    },
    location: { type: String }, // location in platform (as coordinates on the platform map)
    isBazarBooth: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },
    bazarId: { type: mongoose.Schema.Types.ObjectId, ref: "Bazaar" },
    type: { type: String, default: "booth" },
    goLiveAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    cancellationSource: {
      type: String,
      enum: ["vendor", "system", "admin"],
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
    revenue: {
      type: mongoose.Schema.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString("0.00"),
      // getter to return a plain number in JSON output
      get: (v) => {
        return v ? v.toString() : "0.00";
      },
    },
    archive: { type: Boolean, default: false },
    allowedusers: [
      { type: String, enum: ["Student", "Professor", "TA", "Staff"] },
    ],
  },
  { timestamps: true }
);

boothSchema.post("save", async function (doc, next) {
  try {
    if (!doc.isBazarBooth) {
      const message = `Check out ${doc.boothname} — a new booth has been created!`;
      await User.updateMany({}, { $push: { notifications: { message } } });
      await EventsOffice.updateMany(
        {},
        { $push: { notifications: { message } } }
      );
      next();
    }
    next();
  } catch (error) {
    next(error);
  }
});
export default mongoose.model("Booth", boothSchema);
