import mongoose from "mongoose";

const courtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    isReserved: { type: Boolean, default: false },
    reservationId: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
    freeDatesTimes: { type: [Date], default: [] }, // prefilled up to 1 month later
  },
  { timestamps: true }
);

export default mongoose.model("Court", courtSchema);
