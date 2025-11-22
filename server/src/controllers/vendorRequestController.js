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
      location: bazar.location,
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

    // add a field allowedUsers to request if platform booth
    if (!request.isBazarBooth) {
      request.allowedusers = finalArray;
      await request.save();
    }

    try {
      await sendBoothApprovalEmail(vendor, request);
    } catch (emailErr) {
      console.error(
        "Failed to send booth approval email:",
        emailErr && emailErr.message ? emailErr.message : emailErr
      );
    }
    res.json(request);
  } catch (err) {
    next(err);
  }
};

const payForBooth = async (req, res, next) => {
  // Supports 'stripe' (create checkout) and 'manual' (legacy immediate creation)
  try {
    const vendorId = req.user?._id || req.user?.id || req.userId;
    if (!vendorId)
      return res.status(401).json({ message: "Authentication required" });
    const { id } = req.params;
    const method = req.body.method || "stripe"; // default to stripe for new flow
    const request = await VendorRequest.findById(id).populate("bazarId");
    if (!request)
      return res.status(404).json({ message: "VendorRequest not found" });
    if (request.vendorId.toString() !== vendorId.toString()) {
      return res.status(403).json({ message: "Not your vendor request" });
    }
    if (request.status !== "Approved") {
      return res.status(400).json({ message: "Request is not approved" });
    }
    if (request.paymentStatus !== "unpaid") {
      return res
        .status(400)
        .json({ message: "Payment already processed or not allowed" });
    }
    if (
      request.paymentDueAt &&
      new Date(request.paymentDueAt).getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "Payment deadline passed" });
    }

    // STRIPE CHECKOUT FLOW
    if (method === "stripe") {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res
          .status(500)
          .json({ message: "Stripe is not configured on the server" });
      }
      try {
        const StripeLib = (await import("stripe")).default;
        const stripe = new StripeLib(process.env.STRIPE_SECRET_KEY);
        const productName = request.boothname || "Vendor Booth";
        const amount = typeof request.price === "number" ? request.price : 0;
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "egp",
                product_data: { name: productName },
                unit_amount: Math.round(amount * 100),
              },
              quantity: 1,
            },
          ],
          success_url: `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/payment-success?type=vendorRequest&id=${id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/payment-cancelled?type=vendorRequest&id=${id}`,
          metadata: {
            userId: vendorId.toString(),
            vendorRequestId: id,
            type: "vendorRequest",
          },
        });
        return res
          .status(200)
          .json({ url: session.url, sessionId: session.id });
      } catch (stripeErr) {
        console.error(
          "Stripe session creation (vendorRequest) failed",
          stripeErr
        );
        return res
          .status(500)
          .json({ message: "Failed to create Stripe session" });
      }
    }

    // LEGACY / MANUAL FLOW (instant mark paid & create booth)
    if (method === "manual") {
      request.paymentStatus = "paid";
      await request.save();
      await incrementBazaarParticipation(request);
      const vendor = await Vendor.findById(request.vendorId);
      try {
        const body = {
          boothname: request.boothname ? request.boothname : vendor.companyname,
          vendorRequestId: request._id,
          vendorId: request.vendorId,
          isBazarBooth: request.isBazarBooth,
          status: "Approved",
          bazarId: request.bazarId?._id || request.bazarId,
          boothSize: request.boothSize,
          people: request.people,
          location: request.location,
          duration: request.duration,
          startdate: request.startdate,
          enddate: request.enddate,
        };
        const booth = await Booth.create(body);
        try {
          const { sendBoothPaymentReceiptEmail } = await import(
            "../utils/mailer.js"
          );
          await sendBoothPaymentReceiptEmail(vendor, {
            ...booth.toObject(),
            price: request.price,
            people: request.people,
          });
        } catch (emailErr) {
          console.error(
            "Failed to send booth payment receipt:",
            emailErr?.message || emailErr
          );
        }
        return res.json(booth);
      } catch (err) {
        return next(err);
      }
    }

    return res.status(400).json({ message: "Unsupported payment method" });
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

    const eligibility = getCancellationEligibility(request);
    if (!eligibility.ok) {
      return res.status(400).json({ message: eligibility.message });
    }

    const result = await finalizeCancellation(request, {
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
  payForBooth,
  deleteRequest,
  cancelParticipation,
};
