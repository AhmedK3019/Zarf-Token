import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, trim: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, refPath: "actorType" },
    actorType: { type: String, trim: true },
    actorDisplayName: { type: String, trim: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, refPath: "entityType" },
    entityType: { type: String, trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model("AuditLog", auditLogSchema);
