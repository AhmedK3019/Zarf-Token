import mongoose from "mongoose";

const conferenceSchema = new mongoose.Schema({
  conferencename: { type: String, required: true },
  professorname: { type: String, required: true },
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
        comment: { type: String },

        userId: { type: mongoose.Schema.ObjectId, ref: "User" },
      },
    ],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, default: "conference" },
});

const Conference = mongoose.model("Conference", conferenceSchema);
export default Conference;
