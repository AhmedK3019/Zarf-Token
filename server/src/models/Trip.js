import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
  tripname: { type: String, required: true },
  startdate: { type: Date, required: true },
  starttime: { type: String, required: true },
  enddate: { type: Date, required: true },
  endtime: { type: String, required: true },
  location: { type: String, required: true },
  shortdescription: { type: String, required: true },
  registerdeadline: { type: Date, required: true },
  price: { type: Number, required: true },
  capacity: { type: Number, required: true },
  attendees: {
    type: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    default: [],
  },
  type: { type: String, default: "trip" },
});

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
