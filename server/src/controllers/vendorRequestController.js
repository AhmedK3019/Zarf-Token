import VendorRequest from "../models/VendorRequest.js";
import Vendor from "../models/Vendor.js";
import Booth from "../models/Booth.js";
import Bazaar from "../models/Bazaar.js";
import Admin from "../models/Admin.js";
import EventsOffice from "../models/EventsOffice.js";
import User from "../models/User.js";
import {
  sendBoothApprovalEmail,
  sendBoothRejectionEmail,
} from "../utils/mailer.js";
import {
  PAYMENT_WINDOW_DAYS,
  combineDateAndTime,
  finalizeCancellation,
  getCancellationEligibility,
  incrementBazaarParticipation,
  decrementBazaarParticipation,
} from "../services/vendorRequestLifecycle.js";

const computePaymentDueDate = (anchor = new Date()) => {
  const due = new Date(anchor);
  due.setDate(due.getDate() + PAYMENT_WINDOW_DAYS);
  return due;
};

// create request for a bazar: POST /api/vendorRequests/bazar/:bazarId
const createBazarRequest = async (req, res, next) => {
  try {
    const vendorId = req.user?._id || req.user?.id;
    const bazarId = req.params.bazarId;
    const bazar = await Bazaar.findById(bazarId);
    if (!bazar) {
      return res.status(404).json({ message: "Bazaar not found" });
    }
    // calculate duration from bazar dates
    // booth duration is an enum: "1 week", "2 weeks", "3 weeks"
    // so round to nearest week
    let duration = Math.round(
      (bazar.enddate - bazar.startdate) / (1000 * 60 * 60 * 24 * 7)
    );
    if (duration < 1) duration = 1;
    else if (duration > 4) duration = 4;
    if (!vendorId)
      return res.status(401).json({ message: "Authentication required" });
    const vendor = await Vendor.findById(vendorId);
    const { people, boothSize, boothname } = req.body;
    if (!people || !Array.isArray(people) || people.length < 1)
      return res
        .status(400)
        .json({ message: "People array is required (1-5 persons)" });
    if (!boothSize)
      return res.status(400).json({ message: "boothSize is required" });
    let price = 0;
    if (boothSize === "2x2") {
      price = 100 * duration;
    } else if (boothSize === "4x4") {
      price = 180 * duration;
    }
    const doc = await VendorRequest.create({
      vendorId,
      people,
      boothSize,
      boothname,
      isBazarBooth: true,
      duration,
      price,
      bazarId: req.params.bazarId,
      startdate: combineDateAndTime(
        bazar.startdate,
        bazar.starttime || bazar.startTime
      ),
      enddate: combineDateAndTime(
        bazar.enddate,
        bazar.endtime || bazar.endTime
      ),
    });

    const notification = {
      message: `A new vendor request by ${vendor.companyname} for a bazaar booth is pending your approval`,
      isRead: false,
    };

    // Push the notification to all admins in a single DB operation instead of saving each user
    await Admin.updateMany({}, { $push: { notifications: notification } });
    await EventsOffice.updateMany(
      {},
      { $push: { notifications: notification } }
    );
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
    const vendor = await Vendor.findById(vendorId);
    const {
      people,
      duration,
      location,
      boothSize,
      boothname,
      startdate,
      enddate,
    } = req.body;
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
    let price = 0;
    switch (location) {
      case "North West Platform Entrance":
        price = 100 * duration;
        break;
      case "West Platform Entrance":
        price = 120 * duration;
        break;
      case "West Platform Alley":
        price = 140 * duration;
        break;
      case "East Platform Alley":
        price = 160 * duration;
        break;
    }
    const doc = await VendorRequest.create({
      vendorId,
      people,
      duration,
      location,
      price,
      boothSize,
      boothname,
      isBazarBooth: false,
      startdate,
      enddate,
    });
    const notification = {
      message: `A new vendor request by ${vendor.companyname} for a platform booth is pending your approval`,
      isRead: false,
    };

    // Push the notification to all admins in a single DB operation instead of saving each user
    await Admin.updateMany({}, { $push: { notifications: notification } });
    await EventsOffice.updateMany(
      {},
      { $push: { notifications: notification } }
    );
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
    const { allowedusers } = req.body;
    console.log("Allowed users:", allowedusers);
    const request = await VendorRequest.findById(req.params.id).populate(
      "bazarId"
    );
    if (!request)
      return res.status(404).json({ message: "VendorRequest not found" });
    if (
      !allowedusers ||
      (!Array.isArray(allowedusers) && !request.isBazarBooth)
    )
      return res
        .status(400)
        .json({ message: "please select at least one option" });
    const finalArray = [...allowedusers, "Admin", "Event office"];
    const vendor = await Vendor.findById(request.vendorId);
    const approvedAt = new Date();
    request.status = "Approved";
    request.paymentStatus = "unpaid";
    request.paymentDueAt = computePaymentDueDate(approvedAt);
    await request.save();
    await incrementBazaarParticipation(request);
    let body = {
      boothname: vendor ? vendor.companyname : "Vendor Booth",
      vendorRequestId: request._id,
      vendorId: request.vendorId,
      isBazarBooth: request.isBazarBooth,
      status: "Approved",
      bazarId: request.bazarId?._id || request.bazarId,
      boothSize: request.boothSize,
      people: request.people,
      location: request.location,
      duration: request.duration,
      goLiveAt: request.eventStartAt,
    };
    if (!request.isBazarBooth) {
      body.allowedusers = finalArray;
    }
    const booth = await Booth.create(body);
    if (!request.isBazarBooth) {
      await User.updateMany(
        { role: { $in: finalArray } },
        {
          $push: {
            notifications: {
              message: `Check out ${vendor.companyname} — a new platform booth has gone live!`,
            },
          },
        }
      );
      await EventsOffice.updateMany(
        {},
        {
          $push: {
            notifications: {
              message: `Check out ${vendor.companyname} — a new platform booth has gone live!`,
            },
          },
        }
      );
    }

    try {
      await sendBoothApprovalEmail(vendor, booth);
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
    const wasApproved = doc.status === "Approved";
    doc.status = "Rejected";
    await doc.save();
    if (wasApproved) {
      await decrementBazaarParticipation(doc);
    }
    await Booth.deleteMany({ vendorRequestId: doc._id });
    await doc.populate("vendorId");
    try {
      await sendBoothRejectionEmail(doc.vendorId, doc);
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

const cancelParticipation = async (req, res, next) => {
  try {
    const vendorId = req.user?._id || req.user?.id || req.userId;
    if (!vendorId)
      return res.status(401).json({ message: "Authentication required" });

    const request = await VendorRequest.findById(req.params.id)
      .populate("vendorId")
      .populate("bazarId");
    if (!request)
      return res.status(404).json({ message: "VendorRequest not found" });

    const booth = await Booth.findOne({ vendorRequestId: request._id });
    const eligibility = getCancellationEligibility(request, {
      vendorId,
      boothDoc: booth,
    });
    if (!eligibility.ok) {
      return res.status(400).json({ message: eligibility.message });
    }

    const reason =
      typeof req.body?.reason === "string" && req.body.reason.trim().length
        ? req.body.reason.trim()
        : "Cancelled by vendor";

    const result = await finalizeCancellation(request, {
      reason,
      source: "vendor",
      vendorDoc: request.vendorId,
    });

    res.json({
      message: "Participation cancelled successfully",
      request: result.request,
    });
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
  cancelParticipation,
};
