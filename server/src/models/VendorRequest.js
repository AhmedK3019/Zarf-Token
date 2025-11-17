import mongoose from "mongoose";

const peopleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  DocumentId: { type: mongoose.Schema.Types.ObjectId, ref: "Upload" },
});

const vendorRequestSchema = new mongoose.Schema(
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
    duration: { type: Number, enum: [1, 2, 3, 4] }, // in weeks
    boothname: { type: String }, // name of the booth
    boothSize: {
      type: String,
      enum: ["2x2", "4x4"],
      required: true,
    },
    location: { type: String },
    isBazarBooth: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },
    price: { type: Number },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded", "cancelled", "overdue"],
      default: "unpaid",
    },
    paymentDueAt: { type: Date },
    startdate: { type: Date },
    enddate: { type: Date },
    bazarId: { type: mongoose.Schema.Types.ObjectId, ref: "Bazaar" },
  },
  { timestamps: true }
);

export default mongoose.model("VendorRequest", vendorRequestSchema);
