import Vendor from "../models/Vendor.js";
import Booth from "../models/Booth.js";
import Bazaar from "../models/Bazaar.js";
import Admin from "../models/Admin.js";
import EventsOffice from "../models/EventsOffice.js";
import { sendVendorCancellationEmail } from "../utils/mailer.js";

const FALLBACK_PAYMENT_WINDOW_DAYS = 3;

export const PAYMENT_WINDOW_DAYS = Number.isFinite(
  Number(process.env.VENDOR_PAYMENT_WINDOW_DAYS)
)
  ? Number(process.env.VENDOR_PAYMENT_WINDOW_DAYS)
  : FALLBACK_PAYMENT_WINDOW_DAYS;

const CANCELLABLE_STATUSES = ["Pending", "Approved"];
const CANCELLABLE_PAYMENT_STATUSES = ["unpaid"];

export const combineDateAndTime = (date, time) => {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  if (typeof time === "string" && time.includes(":")) {
    const [hours, minutes] = time.split(":").map((part) => parseInt(part, 10));
    parsed.setHours(Number.isFinite(hours) ? hours : 0);
    parsed.setMinutes(Number.isFinite(minutes) ? minutes : 0, 0, 0);
  }
  return parsed;
};

export const hasEventStarted = (request) => {
  const reference = request.startdate;
  if (!reference) return false;
  const start = new Date(reference);
  if (Number.isNaN(start.getTime())) return false;
  return start <= new Date();
};

export const getCancellationEligibility = (request) => {
  if (!request) {
    return { ok: false, message: "Request not found" };
  }
  if (!CANCELLABLE_STATUSES.includes(request.status)) {
    return {
      ok: false,
      code: "INVALID_STATUS",
      message: "Request can only be cancelled while pending or accepted",
    };
  }
  const paymentState = request.paymentStatus || "unpaid";
  if (!CANCELLABLE_PAYMENT_STATUSES.includes(paymentState)) {
    return {
      ok: false,
      code: "PAID",
      message: "Cannot cancel - payment already processed",
    };
  }
  if (hasEventStarted(request)) {
    return {
      ok: false,
      code: "EVENT_STARTED",
      message: "Cannot cancel - event has already started",
    };
  }
  return { ok: true };
};

export const incrementBazaarParticipation = async (request) => {
  if (!request.isBazarBooth || !request.bazarId) return;
  const bazaarId = request.bazarId._id;
  if (!bazaarId) return;
  try {
    await Bazaar.findByIdAndUpdate(
      bazaarId,
      { $inc: { vendorParticipationCount: 1 } },
      { new: false }
    );
  } catch (err) {
    console.error("incrementBazaarParticipation failed:", err?.message || err);
  }
};

export const decrementBazaarParticipation = async (request) => {
  if (!request.isBazarBooth || !request.bazarId) return;
  const bazaar = request.bazarId;
  if (!bazaar) return;
  bazaar.vendorParticipationCount = Math.max(
    0,
    (bazaar.vendorParticipationCount || 0) - 1
  );
  await bazaar.save();
};

const pushStaffNotification = async (message) => {
  if (!message) return;
  const notification = { message, isRead: false };
  await Promise.allSettled([
    Admin.updateMany({}, { $push: { notifications: notification } }),
    EventsOffice.updateMany({}, { $push: { notifications: notification } }),
  ]);
};

const buildStaffCancellationMessage = (request, vendor) => {
  const vendorName =
    vendor?.companyname || vendor?.firstname || vendor?.lastname || "A vendor";
  const eventLabel = request.isBazarBooth
    ? request.bazarId?.bazaarname || "a bazaar"
    : "a platform booth";
  return `${vendorName} cancelled their participation for ${eventLabel}.`;
};

export const finalizeCancellation = async (
  request,
  { vendorDoc, skipEmail = false } = {}
) => {
  const now = new Date();
  request.status = "Cancelled";
  if (
    !request.paymentStatus ||
    request.paymentStatus === "unpaid" ||
    request.paymentStatus === "overdue"
  ) {
    request.paymentStatus = "cancelled";
  }
  request.cancelledAt = now;
  await request.save();

  const vendor = vendorDoc;
  if (!skipEmail && vendor?.email) {
    try {
      await sendVendorCancellationEmail({
        vendor,
        request,
      });
    } catch (err) {
      console.error("sendVendorCancellationEmail failed:", err?.message || err);
    }
  }

  await pushStaffNotification(buildStaffCancellationMessage(request, vendor));
  return { request };
};
