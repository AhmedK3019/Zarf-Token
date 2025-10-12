import mongoose from "mongoose";
const registeredPeople = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: "User" },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  gucid: { type: String, required: true },
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
  type: { type: String, default: "trip" },
});

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
