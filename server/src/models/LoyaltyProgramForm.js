import mongoose from "mongoose";

const loyaltySchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    discountRate: { type: Number, required: true, min: 0, max: 100 },
    promoCode: { type: String, required: true, unique: true },
    termsAndConditions: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("LoyaltyProgramForm", loyaltySchema);
