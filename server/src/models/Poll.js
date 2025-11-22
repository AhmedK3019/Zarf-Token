import mongoose from "mongoose";

const pollSchema = new mongoose.Schema({
  booths: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booth" }],
  votes: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      booth: { type: mongoose.Schema.Types.ObjectId, ref: "Booth" },
    },
  ],
  endDate: { type: Date, required: true },
});

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;
