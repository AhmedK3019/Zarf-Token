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

const resolveId = (docOrId) => {
  if (!docOrId) return null;
  if (typeof docOrId === "string") return docOrId;
  if (docOrId._id) return docOrId._id.toString();
  if (docOrId.id) return docOrId.id.toString();
  if (typeof docOrId.toString === "function") return docOrId.toString();
  return null;
};

const loadVendorDoc = async (request, vendorDoc) => {
  if (vendorDoc && vendorDoc.email) return vendorDoc;
  if (request.vendorId && request.vendorId.email) return request.vendorId;
  const vendorId = resolveId(request.vendorId);
  if (!vendorId) return null;
  return await Vendor.findById(vendorId);
};

const loadBazaarDoc = async (request) => {
  if (!request.isBazarBooth || !request.bazarId) return null;
  if (request.bazarId && request.bazarId.bazaarname) return request.bazarId;
  const bazaarId = resolveId(request.bazarId);
  if (!bazaarId) return null;
  return await Bazaar.findById(bazaarId);
};

export const hasEventStarted = (request, boothDoc = null, now = new Date()) => {
  const reference =
    request.eventStartAt ||
    (request.isBazarBooth && request.bazarId?.startdate
      ? combineDateAndTime(
          request.bazarId.startdate,
          request.bazarId.starttime || request.bazarId.startTime
        )
      : null) ||
    boothDoc?.goLiveAt;
  if (!reference) return false;
  const start = new Date(reference);
  if (Number.isNaN(start.getTime())) return false;
  return start <= now;
};

export const getCancellationEligibility = (
  request,
  { vendorId, boothDoc = null, now = new Date() } = {}
) => {
  if (!request) {
    return { ok: false, message: "Request not found" };
  }
  if (vendorId) {
    const requestVendorId = resolveId(request.vendorId);
    if (!requestVendorId || requestVendorId !== resolveId(vendorId)) {
      return {
        ok: false,
        code: "NOT_OWNER",
        message: "You can only cancel your own request",
      };
    }
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
  if (hasEventStarted(request, boothDoc, now)) {
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
  const bazaarId = resolveId(request.bazarId);
  if (!bazaarId) return;
  try {
    await Bazaar.findByIdAndUpdate(
      bazaarId,
      { $inc: { vendorParticipationCount: 1 } },
      { new: false }
    );
  } catch (err) {
    console.error(
      "incrementBazaarParticipation failed:",
      err?.message || err
    );
  }
};

export const decrementBazaarParticipation = async (request) => {
  if (!request.isBazarBooth || !request.bazarId) return;
  const bazaar = await loadBazaarDoc(request);
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

const syncBoothCancellation = async (request, { now, reason, source }) => {
  let booth = await Booth.findOne({ vendorRequestId: request._id });
  if (!booth) {
    const fallbackQuery = {
      vendorRequestId: { $exists: false },
      vendorId: resolveId(request.vendorId),
      status: "Approved",
    };
    if (request.isBazarBooth) {
      fallbackQuery.bazarId = resolveId(request.bazarId);
    } else {
      fallbackQuery.isBazarBooth = false;
    }
    booth = await Booth.findOne(fallbackQuery).sort({ createdAt: -1 });
  }
  if (!booth) return null;
  booth.status = "Cancelled";
  booth.cancelledAt = now;
  booth.cancellationReason = reason;
  booth.cancellationSource = source;
  await booth.save();
  return booth;
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
  { reason, source = "vendor", vendorDoc, skipEmail = false } = {}
) => {
  const now = new Date();
  request.status = "Cancelled";
  request.cancelledAt = now;
  request.cancellationReason = reason;
  request.cancellationSource = source;
  if (
    !request.paymentStatus ||
    request.paymentStatus === "unpaid" ||
    request.paymentStatus === "overdue"
  ) {
    request.paymentStatus = "cancelled";
  }
  await request.save();

  const booth = await syncBoothCancellation(request, { now, reason, source });
  await decrementBazaarParticipation(request);

  const vendor = await loadVendorDoc(request, vendorDoc);
  if (!skipEmail && vendor?.email) {
    try {
      await sendVendorCancellationEmail({
        vendor,
        request,
        reason,
        isAuto: source === "system",
      });
    } catch (err) {
      console.error(
        "sendVendorCancellationEmail failed:",
        err?.message || err
      );
    }
  }

  await pushStaffNotification(buildStaffCancellationMessage(request, vendor));
  return { request, booth };
};
