import mongoose from "mongoose";

const gymSessionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    time: { type: String, required: true }, // could also merge date+time into one Date
    duration: { type: Number, required: true },
    type: { type: String, required: true },
    maxParticipants: { type: Number, required: true },
    registered: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("GymSession", gymSessionSchema);
