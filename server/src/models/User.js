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
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
      },
    ],
    default: [],
  },
  attendedevents: {
    type: [
      new mongoose.Schema(
        {
          eventid: { type: mongoose.Schema.Types.ObjectId },
          eventname: { type: String },
          eventtype: { type: String },
        },
        { id: false }
      ),
    ],
    default: [],
  },

  createdAt: { type: Date, default: Date.now },
  favouriteEvents: {
    type: [
      {
        itemType: { type: String, required: true }, // model name you will use to resolve, e.g. 'Conference'
        itemId: { type: mongoose.Schema.Types.ObjectId, required: true }, // plain ObjectId, no ref
        addedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  wallet: {
    type: mongoose.Schema.Types.Decimal128,
    default: mongoose.Types.Decimal128.fromString("0.00"),
    // getter to return a plain number in JSON output
    get: (v) => {
      if (v == null) return 0;
      // Decimal128 -> string, then parse to float
      return parseFloat(v.toString());
    },
  },
});

// Ensure getters are applied when converting documents to JSON
userSchema.set("toJSON", { getters: true });

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
