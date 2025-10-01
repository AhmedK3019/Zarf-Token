import Booth from "../models/Booth.js";

export const createBooth = async (req, res) => {
  try {
    const booth = await Booth.create(req.body);
    res.status(201).json(booth);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getBooths = async (req, res) => {
  try {
    const booths = await Booth.find().populate("vendorId");
    res.json(booths);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBooth = async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id).populate("vendorId");
    if (!booth) return res.status(404).json({ error: "Booth not found" });
    res.json(booth);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBooth = async (req, res) => {
  try {
    const booth = await Booth.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(booth);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteBooth = async (req, res) => {
  try {
    await Booth.findByIdAndDelete(req.params.id);
    res.json({ message: "Booth deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
