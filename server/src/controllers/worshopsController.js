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
  proffessorsparticipating: Joi.array().items(Joi.string()).required(),
  fundingsource: Joi.string().valid("External", "GUC").required(),
  extrarequiredfunding: Joi.number().required(),
});
const createWorkshop = async (req, res) => {
  try {
    const { value, error } = workshopSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const workshop = await WorkShop.create(value);
    return res.status(201).json(workshop);
  } catch (error) {
    next(error);
  }
};

const getAllWorkshops = async (req, res, next) => {
  try {
    const workshops = await WorkShop.find();
    return res.status(200).json(workshops);
  } catch (error) {
    next(error);
  }
};

const getWorkshop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workshop = await WorkShop.findById({ _id: id });
    if (!workshop) {
      return res.status(404).json({ error: "Workshop not found" });
    }
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

export default {
  createWorkshop,
  getAllWorkshops,
  getWorkshop,
  updateWorkshop,
  deleteWorkshop,
};
