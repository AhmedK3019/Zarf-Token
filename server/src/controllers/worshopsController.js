import WorkShop from "../models/Workshop.js";
import EventsOffice from "../models/EventsOffice.js";
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
    console.log(req.body);
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
    const { value, error } = workshopSchema.validate(normalizedBody);
    if (error) {
      console.log(error);
      return res.status(400).json({ message: error.details[0].message });
    }
    const workshop = await WorkShop.findByIdAndUpdate(
      { _id: id },
      { $set: value },
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
    const { status } = req.body;
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
    });
    if (!check)
      return res.status(404).json({ message: "Workshop is not found" });
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

    return res.status(200).json({
      message: "Registration canceled successfully",
      workshop: updatedWorkshop,
    });
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
};
