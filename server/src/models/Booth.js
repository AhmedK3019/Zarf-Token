import mongoose from "mongoose";

const peopleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

const boothSchema = new mongoose.Schema(
  {
    boothname: { type: String, required: true },
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
    duration: { type: Number, enum: [1, 2, 3, 4] }, // in weeks
    boothSize: {
      type: String,
      enum: ["2x2", "4x4"],
      required: true,
    },
    location: { type: String }, // location in platform (as coordinates on the platform map)
    isBazarBooth: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    bazarId: { type: mongoose.Schema.Types.ObjectId, ref: "Bazaar" },
    type: { type: String, default: "booth" },
  },
  { timestamps: true }
);

export default mongoose.model("Booth", boothSchema);
