import LoyaltyProgramForm from "../models/LoyaltyProgramForm.js";

export const createForm = async (req, res) => {
  try {
    const form = new LoyaltyProgramForm(req.body);
    await form.save();
    res.status(201).json(form);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getForms = async (req, res) => {
  const forms = await LoyaltyProgramForm.find().populate("vendorId");
  res.json(forms);
};
