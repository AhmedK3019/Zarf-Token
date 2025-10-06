import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const eventsOfficeSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  role: {
    type: String,
  },
  password: { type: String, required: true },
  status: { type: String, enum: ["Active", "Blocked"], default: "Active" },
  notifications: {
    type: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
      },
    ],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
eventsOfficeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to validate password
eventsOfficeSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("EventsOffice", eventsOfficeSchema);
