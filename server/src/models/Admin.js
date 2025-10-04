import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  role: {
    type: String,
  },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

adminSchema.methods.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("Admin", adminSchema);
