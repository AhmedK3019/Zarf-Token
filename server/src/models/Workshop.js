import mongoose from "mongoose";
const registeredPeople = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: "User" },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  gucid: { type: String, required: true },
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
  fundingsource: { type: String, enum: ["External", "GUC"], required: true },
  attendees: {
    type: [registeredPeople],
    default: [],
  },
  extrarequiredfunding: { type: Number },
  type: { type: String, default: "workshop" },
  comments: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Cancelled", "Completed"],
    default: "Pending",
  },
  createdBy: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const Workshop = mongoose.model("Workshop", workshopSchema);

export default Workshop;
