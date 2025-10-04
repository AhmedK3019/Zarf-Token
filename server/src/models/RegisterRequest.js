import mongoose from "mongoose";

const registerRequestSchema = new mongoose.Schema({
  firstname: { type: String },
  lastname: { type: String },
  gucid: { type: String },
  email: { type: String },
  role: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("RegisterRequest", registerRequestSchema);
