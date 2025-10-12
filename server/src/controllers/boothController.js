import Booth from "../models/Booth.js";
import mongoose from "mongoose";

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
    let booths = await Booth.find().populate("vendorId");

    // Now conditionally populate bazarId only for bazar booths
    booths = await Booth.populate(booths, {
      path: "bazarId",
      match: { isBazarBooth: true },
    });
    res.json(booths);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBooth = async (req, res) => {
  try {
    let booth = await Booth.findById(req.params.id).populate("vendorId");
    if (!booth) return res.status(404).json({ error: "Booth not found" });
    if (booth.isBazarBooth) {
      booth = await Booth.populate(booth, "bazarId");
    }
    res.json(booth);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBoothsByBazarId = async (req, res) => {
  try {
    const { bazaarId } = req.params;

    // Defensive: if someone calls /platform here, return empty list or 400
    if (!bazaarId)
      return res.status(400).json({ error: "bazaarId is required" });

    // If bazaarId is the string 'platform' or other sentinel, avoid casting to ObjectId
    if (bazaarId === "platform") {
      return res.status(400).json({ error: "Invalid bazaarId" });
    }

    // ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(bazaarId)) {
      return res.status(400).json({ error: "Invalid bazaarId format" });
    }

    const booths = await Booth.find({
      isBazarBooth: true,
      bazarId: bazaarId,
    })
      .populate("vendorId")
      .populate("bazarId");
    res.json(booths);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllBazarsBooths = async (req, res) => {
  try {
    const booths = await Booth.find({ isBazarBooth: true })
      .populate("vendorId")
      .populate("bazarId");
    res.json(booths);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllPlatformBooths = async (req, res) => {
  try {
    const booths = await Booth.find({ isBazarBooth: false }).populate(
      "vendorId"
    );
    res.json(booths);
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

export const getMyBooths = async (req, res) => {
  try {
    let booths = await Booth.find().populate("vendorId").populate("bazarId");
    res.json(booths);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
