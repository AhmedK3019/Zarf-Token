import mongoose from "mongoose";

const peopleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

const boothSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    people: {
      type: [peopleSchema],
      validate: [
        (arr) => arr.length >= 1 && arr.length <= 5,
        "People must be between 1 and 5",
      ],
    },
    duration: { type: Number, required: true }, // in hours maybe
    boothSize: {
      type: String,
      enum: ["Small", "Medium", "Large"],
      required: true,
    },
    location: { type: String, required: true },
    isBazarBooth: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booth", boothSchema);
