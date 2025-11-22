import mongoose from "mongoose";

const pollSchema = new mongoose.Schema({
  booths: [{ type: mongoose.Schema.Types.ObjectId, ref: "VendorRequest" }],
  votes: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      booth: { type: mongoose.Schema.Types.ObjectId, ref: "VendorRequest" },
    },
  ],
  ended: { type: Boolean, default: false },
});

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;
