import mongoose from "mongoose";

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
  professorsparticipating: { type: [String], required: true },
  fundingsource: { type: String, enum: ["External", "GUC"], required: true },
  extrarequiredfunding: { type: Number, required: true },
});

const Workshop = mongoose.model("Workshop", workshopSchema);

export default Workshop;
