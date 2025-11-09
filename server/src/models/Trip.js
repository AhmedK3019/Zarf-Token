import mongoose from "mongoose";
const registeredPeople = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: "User" },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  gucid: { type: String, required: true },
  paid: { type: Boolean, default: false },
});
const tripSchema = new mongoose.Schema({
  tripname: { type: String, required: true },
  startdate: { type: Date, required: true },
  starttime: { type: String, required: true },
  enddate: { type: Date, required: true },
  endtime: { type: String, required: true },
  location: { type: String, required: true },
  shortdescription: { type: String, required: true },
  registerationdeadline: { type: Date, required: true },
  price: { type: Number, required: true },
  capacity: { type: Number, required: true },
  attendees: {
    type: [registeredPeople],
    default: [],
  },
  registered: {
    type: [registeredPeople],
    default: [],
  },
  type: { type: String, default: "trip" },
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
  revenue: {
    type: mongoose.Schema.Types.Decimal128,
    default: mongoose.Types.Decimal128.fromString("0.00"),
    // getter to return a plain number in JSON output
    get: (v) => {
      return v ? v.toString() : "0.00";
    },
  },
  archive: { type: Boolean, default: false },
});

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
