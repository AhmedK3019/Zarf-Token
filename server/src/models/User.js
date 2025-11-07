import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  gucid: { type: String, unique: true, required: true },
  email: { type: String, required: true },
  role: {
    type: String,
    enum: ["Student", "TA", "Professor", "Staff", "Not Specified"],
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
  attendedevents: {
    type: [
      {
        eventid: { type: mongoose.Schema.Types.ObjectId },
        eventtype: { type: String },
      },
    ],
    default: [],
  },

  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (
    !this.isModified("password") ||
    ["Staff", "TA", "Professor"].includes(this.role)
  )
    return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to validate password
userSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
