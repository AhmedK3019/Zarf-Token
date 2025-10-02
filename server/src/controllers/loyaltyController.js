import LoyaltyProgramForm from "../models/LoyaltyProgramForm.js";
import User from "../models/User.js";

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

    // send notification to students/staff/TAs/professors
    const users = await User.find({
      role: { $in: ["Student", "Staff", "TA", "Professor"] },
    });
    const notification = {
      message: `A new partner has joined our loyalty program. Welcome ${form.vendorId}`,
      isRead: false,
      date: new Date(),
    };

    await Promise.all(
      users.map((user) => {
        user.notifications.push(notification);
        return user.save();
      })
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
