import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    courtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Court",
      required: true,
    },
    dateTime: { type: Date, required: true },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: { type: String, required: true },
    studentGucId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);
