import LoyaltyProgramForm from "../models/LoyaltyProgramForm.js";
import Vendor from "../models/Vendor.js";
import Admin from "../models/Admin.js";
import EventsOffice from "../models/EventsOffice.js";
import AuditLog from "../models/AuditLog.js";
import { sendEmail } from "../utils/mailer.js";

const DISCOUNT_MIN = 1;
const DISCOUNT_MAX = 100;
const TERMS_MIN_LENGTH = 50;
const TERMS_MIN_WORDS = 10;
const ACTIVE_APPLICATION_STATUSES = ["pending", "approved"];

const buildStaffNotification = (vendor) => ({
  message: `${vendor.companyname || vendor.email} submitted a loyalty program application that needs review.`,
  isRead: false,
});

const pushStaffApplicationNotification = async (vendor) => {
  const notification = buildStaffNotification(vendor);
  await Promise.allSettled([
    Admin.updateMany({}, { $push: { notifications: notification } }),
    EventsOffice.updateMany({}, { $push: { notifications: notification } }),
  ]);
};

const recordAuditLog = async ({ vendor, form, ipAddress }) => {
  try {
    await AuditLog.create({
      action: "LOYALTY_APPLICATION_SUBMITTED",
      actorId: vendor._id,
      actorType: "Vendor",
      actorDisplayName: vendor.companyname || vendor.email,
      entityId: form._id,
      entityType: "LoyaltyProgramForm",
      metadata: {
        discountRate: form.discountRate,
        promoCode: form.promoCode,
        status: form.status,
      },
      ipAddress,
    });
  } catch (err) {
    console.error("Failed to record audit log:", err?.message || err);
  }
};

const validateTerms = (terms) => {
  if (typeof terms !== "string") {
    return { ok: false, message: "Terms & conditions are required" };
  }
  const normalized = terms.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length < TERMS_MIN_LENGTH) {
    return {
      ok: false,
      message: `Terms & conditions must be at least ${TERMS_MIN_LENGTH} characters`,
    };
  }
  const wordCount = normalized.split(" ").filter(Boolean).length;
  if (wordCount < TERMS_MIN_WORDS) {
    return {
      ok: false,
      message: `Terms & conditions must include at least ${TERMS_MIN_WORDS} clear statements`,
    };
  }
  return { ok: true, normalized };
};

const sendVendorSubmissionEmail = async ({ vendor, form }) => {
  if (!vendor?.email) return;
  const subject = "We received your loyalty program application";
  const html = `
    <p>Dear ${vendor.companyname || "Vendor"},</p>
    <p>Thank you for applying to join the GUC Loyalty Program. Your application is now <strong>${form.status}</strong> and pending review by our Events Office.</p>
    <p><strong>Submitted Details:</strong></p>
    <ul>
      <li>Promo code: ${form.promoCode}</li>
      <li>Discount rate: ${form.discountRate}%</li>
    </ul>
    <p>We will notify you once the review is complete. If you need to update your submission, please contact the Events Office.</p>
    <p>Best regards,<br/>GUC Events Team</p>
  `;
  try {
    await sendEmail(vendor.email, subject, html, true);
  } catch (err) {
    console.error(
      "Failed to send loyalty application confirmation email:",
      err?.message || err
    );
  }
};

// Create Form
export const createForm = async (req, res) => {
  try {
    const { vendorId, discountRate, promoCode, termsAndConditions } = req.body;

    if (!vendorId) {
      return res.status(400).json({ error: "vendorId is required" });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    const parsedDiscount = Number(discountRate);
    if (
      !Number.isFinite(parsedDiscount) ||
      parsedDiscount < DISCOUNT_MIN ||
      parsedDiscount > DISCOUNT_MAX
    ) {
      return res.status(400).json({
        error: `Discount rate must be between ${DISCOUNT_MIN}% and ${DISCOUNT_MAX}%`,
      });
    }

    const termsValidation = validateTerms(termsAndConditions);
    if (!termsValidation.ok) {
      return res.status(400).json({ error: termsValidation.message });
    }

    const normalizedPromo = (promoCode || "").trim().toUpperCase();
    if (!normalizedPromo) {
      return res.status(400).json({ error: "Promo code is required" });
    }

    const existingPromo = await LoyaltyProgramForm.findOne({
      promoCode: normalizedPromo,
    });
    if (existingPromo) {
      return res
        .status(409)
        .json({ error: "Promo code is already in use. Please choose another." });
    }

    const activeApplication = await LoyaltyProgramForm.findOne({
      vendorId,
      status: { $in: ACTIVE_APPLICATION_STATUSES },
    }).sort({ createdAt: -1 });

    if (activeApplication) {
      return res.status(409).json({
        error:
          "You already have an active application under review. Please wait for the decision before submitting a new one.",
      });
    }

    const form = await LoyaltyProgramForm.create({
      vendorId,
      discountRate: parsedDiscount,
      promoCode: normalizedPromo,
      termsAndConditions: termsValidation.normalized,
      status: "pending",
    });

    await Promise.allSettled([
      pushStaffApplicationNotification(vendor),
      sendVendorSubmissionEmail({ vendor, form }),
      recordAuditLog({ vendor, form, ipAddress: req.ip }),
    ]);

    return res.status(201).json(form);
  } catch (err) {
    console.error("Failed to create loyalty program form:", err?.message || err);
    res.status(400).json({ error: err.message });
  }
};

// Get all Forms
export const getForms = async (req, res) => {
  try {
    const { vendorId, status, limit } = req.query;
    const query = {};
    if (vendorId) query.vendorId = vendorId;
    if (status) {
      const statuses = Array.isArray(status)
        ? status
        : String(status)
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
      if (statuses.length) query.status = { $in: statuses };
    }

    let cursor = LoyaltyProgramForm.find(query)
      .populate("vendorId")
      .sort({ createdAt: -1 });

    const limitNumber = Number(limit);
    if (Number.isFinite(limitNumber) && limitNumber > 0) {
      cursor = cursor.limit(limitNumber);
    }

    const forms = await cursor;
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single Form by ID
export const getForm = async (req, res) => {
  try {
    const form = await LoyaltyProgramForm.findById(req.params.id).populate(
      "vendorId"
    );
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Form
export const deleteForm = async (req, res) => {
  try {
    const form = await LoyaltyProgramForm.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json({ message: "Form deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const checkPromoCode = async (req, res) => {
  try {
    const source =
      req.params?.promoCode || req.query?.promoCode || req.body?.promoCode;
    const promoCode = (source || "").trim().toUpperCase();
    if (!promoCode) {
      return res.status(400).json({ error: "Promo code is required" });
    }
    const exists = await LoyaltyProgramForm.exists({ promoCode });
    res.json({ promoCode, available: !exists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
