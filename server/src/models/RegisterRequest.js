import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const registerRequestSchema = new mongoose.Schema({
  firstname: { type: String },
  lastname: { type: String },
  gucid: { type: String },
  email: { type: String },
  role: {
    type: String,
  },
  password: { type: String },
  status: { type: String },
  createdAt: { type: Date, default: Date.now },
});

registerRequestSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("RegisterRequest", registerRequestSchema);
