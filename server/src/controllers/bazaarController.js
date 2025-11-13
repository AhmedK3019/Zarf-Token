import Bazaar from "../models/Bazaar.js";
import Joi from "joi";
import Booth from "../models/Booth.js";

const bazaarSchema = Joi.object({
  bazaarname: Joi.string().required(),
  startdate: Joi.date().required(),
  starttime: Joi.string().required(),
  enddate: Joi.date().required(),
  endtime: Joi.string().required(),
  location: Joi.string().required(),
  shortdescription: Joi.string().required(),
  registrationdeadline: Joi.date().required(),
  allowedusers: Joi.array().min(1),
});

const createBazaar = async (req, res, next) => {
  try {
    const { value, error } = bazaarSchema.validate(req.body);
    if (error) return res.json({ message: error.message });
    const doc = await Bazaar.create(value);
    return res.json({ bazaar: doc });
  } catch (err) {
    next(err);
  }
};

const getAllBazaars = async (req, res, next) => {
  try {
    const doc = await Bazaar.find();
    return res.json({ bazaar: doc });
  } catch (err) {
    next(err);
  }
};

const getBazaar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Bazaar.findById({ _id: id });
    return res.json({ bazaar: doc });
  } catch (err) {
    next(err);
  }
};

const updateBazaar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, error } = bazaarSchema.validate(req.body);
    if (error) return res.json({ message: error.message });
    const doc = await Bazaar.findByIdAndUpdate(
      id,
      { $set: value },
      { new: true }
    );
    return res.json({ bazaar: doc });
  } catch (err) {
    next(err);
  }
};

const deleteBazaar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Bazaar.findByIdAndDelete(id);
    await Booth.deleteMany({ bazaarId: id });
    return res.json({ message: "bazaar is deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export default {
  createBazaar,
  updateBazaar,
  deleteBazaar,
  getAllBazaars,
  getBazaar,
};
