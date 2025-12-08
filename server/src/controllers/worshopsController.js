import WorkShop from "../models/Workshop.js";
import EventsOffice from "../models/EventsOffice.js";
import User from "../models/User.js";
import Stripe from "stripe";
import { sendCertificate, sendPaymentReceiptEmail } from "../utils/mailer.js";
import userController from "./userController.js";
import mongoose from "mongoose";
import Joi from "joi";
import jwt from "jsonwebtoken";

const workshopSchema = Joi.object({
  workshopname: Joi.string().required(),
  startdate: Joi.date().required(),
  starttime: Joi.string().required(),
  enddate: Joi.date().required(),
  endtime: Joi.string().required(),
  registrationDeadline: Joi.date().required(),
  location: Joi.string().valid("GUC Cairo", "GUC Berlin").required(),
  shortdescription: Joi.string().required(),
  fullagenda: Joi.string().required(),
  facultyresponsibilty: Joi.string().required(),
  professorsparticipating: Joi.array().min(1).required().messages({
    "array.min":
      '"professorsparticipating" must contain at least one professor',
  }),
  status: Joi.string()
    .valid("Pending", "Approved", "Rejected")
    .default("Pending"),
  capacity: Joi.number().integer().min(1).required(),
  fundingsource: Joi.string().valid("External", "GUC").required(),
  requiredFunding: Joi.number().required(),
  extrarequiredfunding: Joi.number().default(0),
  attendees: Joi.array().default([]),
  currentMessage: Joi.object({
    awaitingResponseFrom: Joi.string().allow(""),
    message: Joi.string().allow(""),
  }),
  revenue: Joi.alternatives()
    .try(Joi.number(), Joi.object())
    .optional()
    .default(0),
  archive: Joi.boolean().optional().default(false),
  allowedusers: Joi.array().optional().default([]),
  registered: Joi.array().optional().default([]),
  ratings: Joi.array().optional().default([]),
  userComments: Joi.array().optional().default([]),
  __v: Joi.number().optional(),
});

const attendeesSchema = Joi.object({
  firstname: Joi.string().min(3).max(13).required(),
  lastname: Joi.string().min(3).max(13).required(),
  gucid: Joi.string().required(),
  email: Joi.string()
    .email()
    .required()
    .pattern(
      /^[a-zA-Z0-9._%+-]+(\.[a-zA-Z0-9._%+-]+)*@([a-zA-Z0-9-]+\.)*guc\.edu\.eg$/i
    )
    .messages({
      "string.pattern.base":
        "Email must be a valid GUC email (ending with .guc.edu.eg)",
    }),
});
const createWorkshop = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "No token provided" });
    // normalize common misspellings from older clients
    const normalizedBody = { ...req.body };
    // accept registerationDeadline or registerationdeadline (misspelled) and map to registrationDeadline
    if (
      (Object.prototype.hasOwnProperty.call(
        normalizedBody,
        "registerationDeadline"
      ) ||
        Object.prototype.hasOwnProperty.call(
          normalizedBody,
          "registerationdeadline"
        )) &&
      !Object.prototype.hasOwnProperty.call(
        normalizedBody,
        "registrationDeadline"
      )
    ) {
      normalizedBody.registrationDeadline =
        normalizedBody.registerationDeadline ||
        normalizedBody.registerationdeadline;
      delete normalizedBody.registerationDeadline;
      delete normalizedBody.registerationdeadline;
    }

    const { value, error } = workshopSchema.validate(normalizedBody);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const body = {
      workshopname: value.workshopname,
      startdate: value.startdate,
      starttime: value.starttime,
      enddate: value.enddate,
      endtime: value.endtime,
      registrationDeadline: value.registrationDeadline,
      location: value.location,
      shortdescription: value.shortdescription,
      fullagenda: value.fullagenda,
      facultyresponsibilty: value.facultyresponsibilty,
      professorsparticipating: value.professorsparticipating,
      status: value.status,
      capacity: value.capacity,
      fundingsource: value.fundingsource,
      requiredFunding: value.requiredFunding,
      extrarequiredfunding: value.extrarequiredfunding,
      attendees: value.attendees,
      createdBy: userId,
      currentMessage: value.currentMessage,
    };
    const workshop = await WorkShop.create(body);
    // add a notification for all events office
    const notification = {
      message: `A new workshop "${workshop.workshopname}" has been created and is pending your approval.`,
      isRead: false,
    };
    // Persist the notification to all EventsOffice documents.
    // Previously the code pushed into the in-memory array but did not save the documents,
    // so notifications were never persisted. Use updateMany to atomically push the
    // notification into every EventsOffice.notifications array.
    await EventsOffice.updateMany(
      {},
      { $push: { notifications: notification } }
    );
    return res.status(201).json(workshop);
  } catch (error) {
    next(error);
  }
};

const getAllWorkshops = async (_req, res, next) => {
  try {
    const workshops = await WorkShop.find({}, { __v: 0 })
      .populate("professorsparticipating", "firstname lastname email")
      .populate("createdBy", "firstname lastname email");
    return res.status(200).json(workshops);
  } catch (error) {
    next(error);
  }
};

const getWorkshop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workshop = await WorkShop.findById({ _id: id }, { __v: 0 })
      .populate("professorsparticipating", "firstname lastname email")
      .populate("createdBy", "firstname lastname email");
    if (!workshop) {
      return res.status(404).json({ error: "Workshop not found" });
    }
    return res.status(200).json(workshop);
  } catch (error) {
    next(error);
  }
};

const updateWorkshop = async (req, res, next) => {
  try {
    const { id } = req.params;
    // normalize payload like in createWorkshop
    const normalizedBody = { ...req.body };
    if (
      (Object.prototype.hasOwnProperty.call(
        normalizedBody,
        "registerationDeadline"
      ) ||
        Object.prototype.hasOwnProperty.call(
          normalizedBody,
          "registerationdeadline"
        )) &&
      !Object.prototype.hasOwnProperty.call(
        normalizedBody,
        "registrationDeadline"
      )
    ) {
      normalizedBody.registrationDeadline =
        normalizedBody.registerationDeadline ||
        normalizedBody.registerationdeadline;
      delete normalizedBody.registerationDeadline;
      delete normalizedBody.registerationdeadline;
    }
    const workshop = await WorkShop.findByIdAndUpdate(
      { _id: id },
      { $set: normalizedBody },
      { new: true }
    );
    if (!workshop) {
      return res.status(404).json({ error: "Workshop not found" });
    }
    return res.status(200).json(workshop);
  } catch (error) {
    next(error);
  }
};

const updateWorkshopStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, allowedUsers } = req.body;
    const updatedStatus = await WorkShop.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedStatus)
      return res.status(404).json({ message: "Workshop is not found" });
    updatedStatus.currentMessage.awaitingResponseFrom = "";
    updatedStatus.currentMessage.message = "";
    updatedStatus.comments = "";
    await updatedStatus.save();
    let message = "";
    if (updatedStatus.status == "Approved") {
      if (allowedUsers.length == 0 || !allowedUsers) {
        return res.json({ message: "Please select at least one role" });
      }
      const finalArray = Array.from(
        new Set([...allowedUsers, "Admin", "Event office"])
      );
      let update = await WorkShop.findByIdAndUpdate(
        id,
        { allowedusers: finalArray },
        { new: true }
      );
      message = `${updatedStatus.workshopname} has been accepted`;
      const Message = `Check out ${update.workshopname} — a new workshop is available!`;

      await User.updateMany(
        { role: { $in: update.allowedusers } },
        { $push: { notifications: { message: Message } } }
      );
      await EventsOffice.updateMany(
        {},
        { $push: { notifications: { message: Message } } }
      );
    } else {
      message = `${updatedStatus.workshopname} has been rejected`;
    }
    await userController.updateNotifications(updatedStatus.createdBy, message);
    return res.status(200).json({
      message: "Status is updated successfully",
      workshop: updatedStatus,
    });
  } catch (error) {
    next(error);
  }
};

const requestEdits = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const updatedComment = await WorkShop.findByIdAndUpdate(
      id,
      { comments },
      { new: true }
    );
    if (!updatedComment)
      return res.status(404).json({ message: "Workshop is not found" });
    updatedComment.currentMessage.message =
      "The Events Office requested edits.";
    updatedComment.currentMessage.awaitingResponseFrom = "Professor";
    await updatedComment.save();
    return res.status(200).json({
      message: "Edits are requested successfully",
      workshop: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

const acceptEdits = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedComment = await WorkShop.findById(id);
    if (!updatedComment)
      return res.status(404).json({ message: "Workshop is not found" });
    updatedComment.currentMessage.awaitingResponseFrom = "Event office";
    updatedComment.currentMessage.message = "Professor has accepted the edits.";
    await updatedComment.save();
    return res.status(200).json({
      message: "Edits are accepted successfully",
      workshop: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

const rejectEdits = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedComment = await WorkShop.findById(id);
    if (!updatedComment)
      return res.status(404).json({ message: "Workshop is not found" });
    updatedComment.currentMessage.awaitingResponseFrom = "Event office";
    updatedComment.currentMessage.message = "Professor has rejected the edits.";
    await updatedComment.save();
    return res.status(200).json({
      message: "Edits are rejected successfully",
      workshop: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

const getMyWorkshops = async (req, res, next) => {
  try {
    const myId = req.userId;
    if (!myId) return res.status(401).json({ message: "Token is not found" });
    const myWorkshops = await WorkShop.find({ createdBy: myId })
      .populate("professorsparticipating", "firstname lastname email")
      .populate("createdBy", "firstname lastname email");
    if (!myWorkshops)
      return res
        .status(404)
        .json({ message: "You did not create any workshops yet" });
    return res.status(200).json({ myworkshops: myWorkshops });
  } catch (error) {
    next(error);
  }
};
const deleteWorkshop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workshop = await WorkShop.findByIdAndDelete({ _id: id });
    if (!workshop) {
      return res.status(404).json({ error: "Workshop not found" });
    }
    return res.status(200).json({ message: "Workshop deleted successfully" });
  } catch (error) {
    next(error);
  }
};
const registerForWorkshop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "No token provided" });
    const check = await WorkShop.findById(id, {
      capacity: 1,
      attendees: 1,
      registered: 1,
      createdBy: 1,
    });
    if (!check)
      return res.status(404).json({ message: "Workshop is not found" });

    // Check if user is the creator of the workshop
    if (check.createdBy && check.createdBy.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot register for your own workshop" });
    }

    if (
      check.attendees.some((a) => a.userId?.toString() === userId.toString()) ||
      check.registered.some((a) => a.userId?.toString() === userId.toString())
    ) {
      return res
        .status(400)
        .json({ message: "You already registered for this workshop" });
    }
    if (check.attendees.length + 1 > check.capacity) {
      return res.status(400).json({ message: "Workshop is full" });
    }
    const { value, error } = attendeesSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const body = {
      userId: userId,
      firstname: value.firstname,
      lastname: value.lastname,
      gucid: value.gucid,
      email: value.email,
    };
    const afterUpdate = await WorkShop.findByIdAndUpdate(
      id,
      { $addToSet: { registered: body } },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "done updating", workshop: afterUpdate });
  } catch (error) {
    next(error);
  }
};

const cancelRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "No token provided" });
    const workshop = await WorkShop.findById(id);
    if (!workshop)
      return res.status(404).json({ message: "Workshop not found" });
    const attendee = workshop.attendees.find(
      (a) => a.userId.toString() === userId.toString()
    );
    if (!attendee)
      return res
        .status(404)
        .json({ message: "You are not registered for this workshop" });

    const updatedWorkshop = await WorkShop.findByIdAndUpdate(
      id,
      { $pull: { attendees: { userId: userId } } },
      { new: true }
    );

    // notify other users that a spot is available
    if (workshop.toBeNotified.length > 0) {
      try {
        await User.updateMany(
          { _id: { $in: workshop.toBeNotified } },
          {
            $push: {
              notifications: {
                message: `A spot has opened up for the workshop "${workshop.workshopname}".`,
                isRead: false,
              },
            },
          }
        );
      } catch (notifyError) {
        console.error(
          "Failed to notify users about workshop availability:",
          notifyError
        );
      }
    }

    await User.findByIdAndUpdate(
      userId,
      { $inc: { wallet: updatedWorkshop.requiredFunding } },
      { new: true }
    );

    return res.status(200).json({
      message: "Registration canceled successfully",
      workshop: updatedWorkshop,
    });
  } catch (error) {
    next(error);
  }
};

const payForWorkshop = async (req, res, next) => {
  // Supports 'wallet' | 'stripe' | 'creditcard' (legacy mock)
  try {
    const { id } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "No token provided" });
    const workshop = await WorkShop.findById(id);
    const method = req.body.method;
    if (!workshop)
      return res.status(404).json({ message: "Workshop not found" });
    const attendee = workshop.registered.find(
      (a) => a.userId.toString() === userId.toString()
    );
    if (!attendee)
      return res
        .status(404)
        .json({ message: "You are not registered for this workshop" });
    if (attendee.paid)
      return res.status(400).json({ message: "You have already paid" });

    const amount = workshop.requiredFunding; // unified field for cost
    if (method === "wallet") {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.wallet < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      user.wallet -= amount;
      await user.save();
      attendee.paid = true;
      workshop.attendees.push(attendee);
      workshop.registered = workshop.registered.filter(
        (a) => a.userId.toString() !== userId.toString()
      );
      await workshop.save();
      try {
        await sendPaymentReceiptEmail({
          to: attendee.email,
          name: `${attendee.firstname} ${attendee.lastname}`.trim(),
          eventType: "workshop",
          eventName: workshop.workshopname,
          amount,
          currency: "EGP",
          paymentMethod: "Wallet",
        });
      } catch (e) {
        console.error(
          "Failed to send workshop wallet receipt:",
          e?.message || e
        );
      }
      return res.status(200).json({ message: "Payment successful", workshop });
    } else if (method === "stripe") {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res
          .status(500)
          .json({ message: "Stripe is not configured on the server" });
      }
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "egp",
                product_data: { name: workshop.workshopname },
                unit_amount: Math.round(amount * 100),
              },
              quantity: 1,
            },
          ],
          success_url: `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/payment-success?type=workshop&id=${id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/payment-cancelled?type=workshop&id=${id}`,
          metadata: { userId, workshopId: id, type: "workshop" },
        });
        return res
          .status(200)
          .json({ url: session.url, sessionId: session.id });
      } catch (stripeErr) {
        console.error("Stripe session creation failed", stripeErr);
        return res
          .status(500)
          .json({ message: "Failed to create Stripe session" });
      }
    } else if (method === "creditcard") {
      // legacy mock path
      attendee.paid = true;
      workshop.attendees.push(attendee);
      workshop.registered = workshop.registered.filter(
        (a) => a.userId.toString() !== userId.toString()
      );
      await workshop.save();
      try {
        await sendPaymentReceiptEmail({
          to: attendee.email,
          name: `${attendee.firstname} ${attendee.lastname}`.trim(),
          eventType: "workshop",
          eventName: workshop.workshopname,
          amount,
          currency: "EGP",
          paymentMethod: "Credit Card (Mock)",
        });
      } catch (e) {
        console.error(
          "Failed to send workshop creditcard receipt:",
          e?.message || e
        );
      }
      return res
        .status(200)
        .json({ message: "Mock credit card payment successful", workshop });
    } else {
      return res.status(400).json({ message: "Unsupported payment method" });
    }
  } catch (error) {
    next(error);
  }
};

const askToBeNotified = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "No token provided" });
    const workshop = await WorkShop.findById(id);
    if (!workshop)
      return res.status(404).json({ message: "Workshop not found" });
    if (workshop.toBeNotified.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are already registered to be notified" });
    }
    workshop.toBeNotified.push(userId);
    await workshop.save();
    return res
      .status(200)
      .json({ message: "You have been registered to be notified" });
  } catch (error) {
    next(error);
  }
};

const unPackToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    return null;
  }
};

const certificateEmail = async () => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const workshops = await WorkShop.find({
      enddate: { $gte: startOfToday, $lte: startOfTomorrow },
    }).select("attendees workshopname");
    for (const workshop of workshops) {
      let subject = `Successfully attended ${workshop.workshopname}`;
      let participants = workshop.attendees;
      for (const participant of participants) {
        await sendCertificate(
          participant.email,
          participant.firstname,
          workshop.workshopname,
          subject
        );
      }
    }
  } catch (error) {
    console.error("An error occured:", error);
  }
};
export default {
  createWorkshop,
  getAllWorkshops,
  getWorkshop,
  updateWorkshop,
  deleteWorkshop,
  registerForWorkshop,
  cancelRegistration,
  updateWorkshopStatus,
  getMyWorkshops,
  requestEdits,
  acceptEdits,
  rejectEdits,
  payForWorkshop,
  // setAllowedRoles,
  askToBeNotified,
  certificateEmail,
};
