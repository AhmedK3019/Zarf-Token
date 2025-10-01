import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    fileId: { type: String, required: true }, // stored as e.g. 123.pdf in uploads/
    fileName: { type: String, required: true }, // original name
  },
  { timestamps: true }
);

export default mongoose.model("Upload", uploadSchema);
