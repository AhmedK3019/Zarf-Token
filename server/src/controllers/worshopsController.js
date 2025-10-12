import WorkShop from "../models/Workshop.js";
import Joi from "joi";

const workshopSchema = Joi.object({
  workshopname: Joi.string().required(),
  startdate: Joi.date().required(),
  starttime: Joi.string().required(),
  enddate: Joi.date().required(),
  endtime: Joi.string().required(),
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
  extrarequiredfunding: Joi.number().default(0),
  attendees: Joi.array().default([]),
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
    const { value, error } = workshopSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const body = {
      workshopname: value.workshopname,
      startdate: value.startdate,
      starttime: value.starttime,
      enddate: value.enddate,
      endtime: value.endtime,
      location: value.location,
      shortdescription: value.shortdescription,
      fullagenda: value.fullagenda,
      facultyresponsibilty: value.facultyresponsibilty,
      professorsparticipating: value.professorsparticipating,
      status: value.status,
      capacity: value.capacity,
      fundingsource: value.fundingsource,
      extrarequiredfunding: value.extrarequiredfunding,
      attendees: value.attendees,
      createdBy: userId,
    };
    const workshop = await WorkShop.create(body);
    return res.status(201).json(workshop);
  } catch (error) {
    next(error);
  }
};

const getAllWorkshops = async (_req, res, next) => {
  try {
    const workshops = await WorkShop.find({}, { __v: 0 });
    return res.status(200).json(workshops);
  } catch (error) {
    next(error);
  }
};

const getWorkshop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workshop = await WorkShop.findById({ _id: id }, { __v: 0 });
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
    const { value, error } = workshopSchema.validate(req.body);
    if (error) {
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

// (TODO : Update workshop status )

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
    return res.status(200).json({
      message: "Edits are requested successfully",
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
    const myWorkshops = await WorkShop.find({ createdBy: myId });
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
    const check = await WorkShop.findById(id, { capacity: 1, attendees: 1 });
    if (!check)
      return res.status(404).json({ message: "Workshop is not found" });
    if (
      check.attendees.some((a) => a.userId?.toString() === userId.toString())
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
      { $addToSet: { attendees: body } },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "done updating", workshop: afterUpdate });
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
  updateWorkshopStatus,
  getMyWorkshops,
  requestEdits,
};
