import VendorRequest from "../models/VendorRequest.js";
import Vendor from "../models/Vendor.js";
import Booth from "../models/Booth.js";
import {
  sendBoothApprovalEmail,
  sendBoothRejectionEmail,
} from "../utils/mailer.js";

// create request for a bazar: POST /api/vendorRequests/bazar/:bazarId
const createBazarRequest = async (req, res, next) => {
  try {
    const vendorId = req.user?._id || req.user?.id;
    if (!vendorId)
      return res.status(401).json({ message: "Authentication required" });

    const { people, boothSize } = req.body;
    if (!people || !Array.isArray(people) || people.length < 1)
      return res
        .status(400)
        .json({ message: "People array is required (1-5 persons)" });
    if (!boothSize)
      return res.status(400).json({ message: "boothSize is required" });

    const doc = await VendorRequest.create({
      vendorId,
      people,
      boothSize,
      isBazarBooth: true,
      bazarId: req.params.bazarId,
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

// create request for platform: POST /api/vendorRequests/platform
const createPlatformRequest = async (req, res, next) => {
  try {
    const vendorId = req.user?._id || req.user?.id;
    if (!vendorId)
      return res.status(401).json({ message: "Authentication required" });

    const { people, duration, location, boothSize } = req.body;
    if (!people || !Array.isArray(people) || people.length < 1)
      return res
        .status(400)
        .json({ message: "People array is required (1-5 persons)" });
    if (!duration)
      return res.status(400).json({ message: "duration is required" });
    if (!location)
      return res.status(400).json({ message: "location is required" });
    if (!boothSize)
      return res.status(400).json({ message: "boothSize is required" });

    const doc = await VendorRequest.create({
      vendorId,
      people,
      duration,
      location,
      boothSize,
      isBazarBooth: false,
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

const getRequests = async (req, res, next) => {
  try {
    const docs = await VendorRequest.find()
      .populate("vendorId")
      .populate("bazarId");
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const vendorId = req.user?._id || req.user?.id;
    if (!vendorId)
      return res.status(401).json({ message: "Authentication required" });

    const docs = await VendorRequest.find({ vendorId })
      .populate("vendorId")
      .populate("bazarId");
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

const getRequest = async (req, res, next) => {
  try {
    const doc = await VendorRequest.findById(req.params.id)
      .populate("vendorId")
      .populate("bazarId");
    if (!doc)
      return res.status(404).json({ message: "VendorRequest not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

const updateRequest = async (req, res, next) => {
  try {
    const doc = await VendorRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doc)
      return res.status(404).json({ message: "VendorRequest not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

const acceptRequest = async (req, res, next) => {
  try {
    const request = await VendorRequest.findById(req.params.id);
    const vendor = await Vendor.findById(request.vendorId);
    if (!request)
      return res.status(404).json({ message: "VendorRequest not found" });
    request.status = "Approved";
    await request.save();
    const booth = await Booth.create({
      boothname: vendor ? vendor.companyname : "Vendor Booth",
      vendorId: request.vendorId,
      isBazarBooth: request.isBazarBooth,
      bazarId: request.bazarId,
      boothSize: request.boothSize,
      people: request.people,
      location: request.location,
      duration: request.duration,
    });
    try {
      await mailer.sendBoothApprovalEmail(request.vendorId, booth);
    } catch (emailErr) {
      console.error(
        "Failed to send booth approval email:",
        emailErr && emailErr.message ? emailErr.message : emailErr
      );
    }
    res.json(booth);
  } catch (err) {
    next(err);
  }
};

const deleteRequest = async (req, res, next) => {
  try {
    const doc = await VendorRequest.findById(req.params.id);
    if (!doc)
      return res.status(404).json({ message: "VendorRequest not found" });
    // send a rejection email to vendor
    doc.status = "Rejected";
    try {
      await mailer.sendBoothRejectionEmail(request.vendorId, doc);
    } catch (emailErr) {
      console.error(
        "Failed to send booth rejection email:",
        emailErr && emailErr.message ? emailErr.message : emailErr
      );
    }
    res.json({ message: "VendorRequest rejected" });
  } catch (err) {
    next(err);
  }
};

export default {
  createBazarRequest,
  createPlatformRequest,
  getRequests,
  getMyRequests,
  getRequest,
  updateRequest,
  acceptRequest,
  deleteRequest,
};
