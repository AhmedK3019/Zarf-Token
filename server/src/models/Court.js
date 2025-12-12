import mongoose from "mongoose";

function generateDailySlots(date) {
  const slots = [];
  const startHour = 10;
  const intervalMinutes = 90;
  const numSlots = 4;

  for (let i = 0; i < numSlots; i++) {
    const slotDate = new Date(date);
    slotDate.setHours(startHour + Math.floor((i * intervalMinutes) / 60));
    slotDate.setMinutes((i * intervalMinutes) % 60);
    slotDate.setSeconds(0);
    slotDate.setMilliseconds(0);

    if (slotDate > new Date()) {
      slots.push({
        dateTime: slotDate,
        isReserved: false,
        reservationId: null,
      });
    }
  }

  return slots;
}

function generateMonthlySlots() {
  const slots = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const currentDay = new Date(today);
    currentDay.setDate(today.getDate() + i);
    currentDay.setHours(0, 0, 0, 0);

    slots.push(...generateDailySlots(currentDay));
  }

  return slots;
}

const courtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["basketball", "tennis", "football"],
      required: true,
    },
    image: { type: String, required: false }, // Optional custom image path
    freeSlots: [
      {
        dateTime: { type: Date, required: true },
        isReserved: { type: Boolean, default: false },
        reservationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Reservation",
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

// Prefill slots when a court is first created
courtSchema.pre("save", function (next) {
  if (this.isNew && (!this.freeSlots || this.freeSlots.length === 0)) {
    this.freeSlots = generateMonthlySlots();
  }
  next();
});

export const Court = mongoose.model("Court", courtSchema);
