import mongoose from "mongoose";

const registerRequestSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  firstname: { type: String },
  lastname: { type: String },
  gucid: { type: String },
  email: { type: String },
  role: {
    type: String,
  },
  status: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("RegisterRequest", registerRequestSchema);
