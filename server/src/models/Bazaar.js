import mongoose from "mongoose";

const bazaarSchema = new mongoose.Schema({
  bazaarname: { type: String, required: true },
  startdate: { type: Date, required: true },
  starttime: { type: String, required: true },
  enddate: { type: Date, required: true },
  endtime: { type: String, required: true },
  location: { type: String, required: true },
  shortdescription: { type: String, required: true },
  registerdeadline: { type: Date, required: true },
});

const Bazaar = mongoose.model("Bazaar", bazaarSchema);
export default Bazaar;
