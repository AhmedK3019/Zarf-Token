import LoyaltyProgramForm from "../models/LoyaltyProgramForm.js";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";

// Create Form
export const createForm = async (req, res) => {
  try {
    const { vendorId } = req.body;

    // find vendor to get its name
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    // create form
    const form = new LoyaltyProgramForm(req.body);
    await form.save();

    // send notification to all users
    const users = await User.find();
    const notification = {
      message: `A new partner has joined our loyalty program. Welcome ${vendor.companyname}`,
      isRead: false,
    };

    // Push the notification to all users in a single DB operation instead of saving each user
    const res = await User.updateMany(
      {},
      { $push: { notifications: notification } }
    );

    res.status(201).json(form);
  } catch (err) {
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
