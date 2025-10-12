import Trip from "../models/Trip.js";
import Joi from "joi";

const TripSchema = Joi.object({
  tripname: Joi.string().required(),
  startdate: Joi.date().required(),
  starttime: Joi.string().required(),
  enddate: Joi.date().required(),
  endtime: Joi.string().required(),
  location: Joi.string().required(),
  shortdescription: Joi.string().required(),
  registerationdeadline: Joi.date().required(),
  price: Joi.number().required(),
  capacity: Joi.number().required(),
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

const createTrip = async (req, res, next) => {
  try {
    const { value, error } = TripSchema.validate(req.body);
    if (error) return res.json({ message: error.message });
    const doc = await Trip.create(value);
    return res.json({ trip: doc });
  } catch (err) {
    next(err);
  }
};

const getAllTrips = async (_req, res, next) => {
  try {
    const doc = await Trip.find();
    return res.json({ trips: doc });
  } catch (err) {
    next(err);
  }
};

const getTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Trip.findById({ _id: id });
    return res.json({ trip: doc });
  } catch (err) {
    next(err);
  }
};

const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, error } = TripSchema.validate(req.body);
    if (error) return res.json({ message: error.message });
    const doc = await Trip.findByIdAndUpdate(
      id,
      { $set: value },
      { new: true }
    );
    return res.json({ trip: doc });
  } catch (err) {
    next(err);
  }
};

const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Trip.findByIdAndDelete(id);
    return res.json({ message: "Trip is successfully deleted" });
  } catch (err) {
    next(err);
  }
};

const registerForTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "No token provided" });
    const check = await Trip.findById(id, { capacity: 1, attendees: 1 });
    if (!check) return res.status(404).json({ message: "Trip is not found" });
    if (
      check.attendees.some((a) => a.userId?.toString() === userId.toString())
    ) {
      return res
        .status(400)
        .json({ message: "You already registered for this trip" });
    }
    if (check.attendees.length + 1 > check.capacity) {
      return res.status(400).json({ message: "Trip is full" });
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
    const afterUpdate = await Trip.findByIdAndUpdate(
      id,
      { $addToSet: { attendees: body } },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "done updating", trip: afterUpdate });
  } catch (error) {
    next(error);
  }
};
export default {
  createTrip,
  updateTrip,
  deleteTrip,
  getAllTrips,
  getTrip,
  registerForTrip,
};
