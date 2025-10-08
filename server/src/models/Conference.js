import mongoose from "mongoose";

const conderenceSchema = new mongoose.Schema({
  conferencename: { type: String, required: true },
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
  createdAt: { type: Date, default: Date.now },
});

const Conference = mongoose.model("Conference", conderenceSchema);
export default Conference;
