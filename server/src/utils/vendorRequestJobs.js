import VendorRequest from "../models/VendorRequest.js";
import { finalizeCancellation } from "../services/vendorRequestLifecycle.js";

export const autoCancelOverdueVendorRequests = async () => {
  const now = new Date();

  const overdueRequests = await VendorRequest.find({
    status: "Approved",
    paymentStatus: { $in: ["unpaid", "overdue", null] },
    paymentDueAt: { $lte: now },
  })
    .populate("vendorId")
    .populate("bazarId");

  let processed = 0;
  for (const request of overdueRequests) {
    try {
      await finalizeCancellation(request, {
        source: "system",
        vendorDoc: request.vendorId,
      });
      processed += 1;
    } catch (err) {
      console.error(
        `autoCancelOverdueVendorRequests failed for ${request._id}:`,
        err?.message || err
      );
    }
  }

  return processed;
};
