import mongoose from "mongoose";

const DETAILED_TERMS_MIN_CHARS = 50;
const DETAILED_TERMS_MIN_WORDS = 10;

const loyaltySchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    discountRate: { type: Number, required: true, min: 1, max: 100 },
    promoCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    termsAndConditions: {
      type: String,
      required: true,
      trim: true,
      minlength: [
        DETAILED_TERMS_MIN_CHARS,
        `Terms & conditions must be at least ${DETAILED_TERMS_MIN_CHARS} characters`,
      ],
      validate: {
        validator(value) {
          if (!value) return false;
          const normalized = value.trim().replace(/\s+/g, " ");
          const wordCount = normalized ? normalized.split(" ").length : 0;
          return wordCount >= DETAILED_TERMS_MIN_WORDS;
        },
        message: `Terms & conditions must include at least ${DETAILED_TERMS_MIN_WORDS} meaningful statements/words`,
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "reviewerModel",
    },
    reviewerModel: {
      type: String,
      enum: ["Admin", "EventsOffice"],
    },
    reviewedAt: { type: Date },
    reviewerNotes: { type: String, trim: true },
    statusHistory: {
      type: [
        {
          status: {
            type: String,
            enum: ["pending", "approved", "rejected", "cancelled"],
            required: true,
          },
          changedAt: { type: Date, default: Date.now },
          changedBy: { type: String, trim: true },
          notes: { type: String, trim: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

loyaltySchema.pre("save", function (next) {
  if (this.isNew && !this.statusHistory.length) {
    this.statusHistory.push({ status: this.status || "pending" });
  }
  next();
});

export default mongoose.model("LoyaltyProgramForm", loyaltySchema);
