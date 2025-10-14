import Conference from "../models/Conference.js";
import Joi from "joi";

const conferenceSchema = Joi.object({
  conferencename: Joi.string().required(),
  startdate: Joi.date().required(),
  starttime: Joi.string().required(),
  enddate: Joi.date().required(),
  endtime: Joi.string().required(),
  shortdescription: Joi.string().required(),
  location: Joi.string().required(),
  fullagenda: Joi.string().required(),
  conferencelink: Joi.string().uri().required(),
  requiredbudget: Joi.number().required(),
  sourceoffunding: Joi.string().valid("External", "GUC").required(),
  extrarequiredresources: Joi.string().allow(""),
});

const createConference = async (req, res, next) => {
  try {
    const { error, value } = conferenceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const doc = await Conference.create(value);
    return res.status(201).json({ conference: doc });
  } catch (error) {
    next(error);
  }
};

const getAllConferences = async (_req, res, next) => {
  try {
    const conferences = await Conference.find();
    return res.status(200).json({ conferences });
  } catch (error) {
    next(error);
  }
};

const getConferenceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conference = await Conference.findById({ _id: id });
    if (!conference) {
      return res.status(404).json({ message: "Conference not found" });
    }
    return res.status(200).json({ conference });
  } catch (error) {
    next(error);
  }
};

const updateConference = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = conferenceSchema.validate(req.body);
    if (error) {
      console.log(error);
      return res.status(400).json({ message: error.details[0].message });
    }
    const conference = await Conference.findByIdAndUpdate(
      id,
      { $set: value },
      { new: true }
    );
    if (!conference) {
      conference.log("here");
      return res.status(404).json({ message: "Conference not found" });
    }
    return res.status(200).json({ conference });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteConference = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conference = await Conference.findByIdAndDelete(id);
    if (!conference) {
      return res.status(404).json({ message: "Conference not found" });
    }
    return res.status(200).json({ message: "Conference deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export default {
  createConference,
  getAllConferences,
  getConferenceById,
  updateConference,
  deleteConference,
};
