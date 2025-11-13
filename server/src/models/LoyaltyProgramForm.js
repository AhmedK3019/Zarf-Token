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
    },
    termsAndConditions: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("LoyaltyProgramForm", loyaltySchema);
