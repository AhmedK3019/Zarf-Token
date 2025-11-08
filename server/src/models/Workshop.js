import mongoose from "mongoose";
const registeredPeople = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: "User" },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  gucid: { type: String, required: true },
  paid: { type: Boolean, default: false },
});
const workshopSchema = new mongoose.Schema({
  workshopname: { type: String, required: true },
  startdate: { type: Date, required: true },
  starttime: { type: String, required: true },
  enddate: { type: Date, required: true },
  endtime: { type: String, required: true },
  location: { type: String, enum: ["GUC Cairo", "GUC Berlin"], required: true },
  shortdescription: { type: String, required: true },
  fullagenda: { type: String, required: true },
  facultyresponsibilty: { type: String, required: true },
  professorsparticipating: {
    type: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    default: [],
  },
  // Number of seats available for this workshop
  capacity: { type: Number, required: true },
  // Registration price in EGP
  fundingsource: { type: String, enum: ["External", "GUC"], required: true },
  attendees: {
    type: [registeredPeople],
    default: [],
  },
  registered: {
    type: [registeredPeople],
    default: [],
  },
  requiredFunding: { type: Number, required: true },
  extrarequiredfunding: { type: Number },
  type: { type: String, default: "workshop" },
  comments: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Cancelled", "Completed"],
    default: "Pending",
  },
  registrationDeadline: { type: Date },
  currentMessage: {
    awaitingResponseFrom: { type: String, default: "" },
    message: { type: String, default: "" },
  },
  ratings: {
    type: [
      {
        rating: { type: Number, enum: [0, 1, 2, 3, 4, 5], default: 0 },

        userId: { type: mongoose.Schema.ObjectId, ref: "User" },
      },
    ],
    default: [],
  },
  comments: {
    type: [
      {
        rating: { type: Number, enum: [0, 1, 2, 3, 4, 5], default: 0 },

        userId: { type: mongoose.Schema.ObjectId, ref: "User" },
      },
    ],
    default: [],
  },

  createdBy: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  revenue: {
    type: mongoose.Schema.Types.Decimal128,
    default: mongoose.Types.Decimal128.fromString("0.00"),
    // getter to return a plain number in JSON output
    get: (v) => {
      return v ? v.toString() : "0.00";
    },
  },
});

const Workshop = mongoose.model("Workshop", workshopSchema);

export default Workshop;
