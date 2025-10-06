import Trip from "../models/Trip.js";
import Joi from "joi";

const TripSchema = Joi.object({
  bazaarname: Joi.string().required(),
  startdate: Joi.date().required(),
  starttime: Joi.string().required(),
  enddate: Joi.date().required(),
  endtime: Joi.string().required(),
  location: Joi.string().required(),
  shortdescription: Joi.string().required(),
  registerdeadline: Joi.date().required(),
  price: Joi.number().required(),
  capacity: Joi.number().required(),
});

const createTrip = async (req, res, next) => {
  try {
    const { value, error } = TripSchema.validate(req.body);
    if (error) return res.json({ message: error.message });
    const doc = await Bazaar.create(value);
    return res.json({ bazaar: doc });
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
    const doc = await Trip.findById(id);
    return res.json({ trip: doc });
  } catch (err) {
    next(err);
  }
};

const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Trip.findByIdAndUpdate(
      id,
      { $set: req.body },
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

export default {
  createTrip,
  updateTrip,
  deleteTrip,
  getAllTrips,
  getTrip,
};
