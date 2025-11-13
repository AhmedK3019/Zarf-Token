import LoyaltyProgramForm from "../models/LoyaltyProgramForm.js";
import Vendor from "../models/Vendor.js";
import Admin from "../models/Admin.js";
import EventsOffice from "../models/EventsOffice.js";
import User from "../models/User.js";
const DISCOUNT_MIN = 1;
const DISCOUNT_MAX = 100;

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

    const activeApplication = await LoyaltyProgramForm.findOne({ vendorId });

    if (activeApplication) {
      return res.status(409).json({
        error:
          "You already have an active application under review. Please wait for the decision before submitting a new one.",
      });
    }

    const form = await LoyaltyProgramForm.create({
      vendorId,
      discountRate: parsedDiscount,
      promoCode: promoCode,
      termsAndConditions: termsAndConditions,
    });

    (await User.find()).map((user) => {
      // notify users about new loyalty program application
      user.notifications.push({
        message: `A new vendor joined our loyalty program.\n Welcome ${vendor.name}.`,
        isRead: false,
      });
      user.save();
    });

    return res.status(201).json(form);
  } catch (err) {
    console.error(
      "Failed to create loyalty program form:",
      err?.message || err
    );
    res.status(400).json({ error: err.message });
  }
};

// Get all Forms
export const getForms = async (req, res) => {
  try {
    const forms = await LoyaltyProgramForm.find().populate("vendorId");
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single Form by ID
export const getForm = async (req, res) => {
  try {
    const form = await LoyaltyProgramForm.findOne({
      vendorId: req.params.vendorId,
    }).populate("vendorId");
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Form
export const deleteForm = async (req, res) => {
  try {
    const form = await LoyaltyProgramForm.findOneAndDelete({
      vendorId: req.params.vendorId,
    });
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json({ message: "Form deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
