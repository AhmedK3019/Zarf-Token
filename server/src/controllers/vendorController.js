import Vendor from "../models/Vendor.js";
import Upload from "../models/Upload.js";
import Joi from "joi";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vendorSchema = Joi.object({
  companyname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  taxcard: Joi.string().required(),
  logo: Joi.string().required(),
  status: Joi.string().valid("Active", "Blocked").default("Active"),
  role: Joi.string().default("Vendor"),
});

const signupvendor = async (req, res, next) => {
  try {
    const { companyname, email, password, status } = req.body;
    const { value, error } = vendorSchema.validate({
      companyname,
      email,
      password,
      taxcard: req.files?.taxcard?.[0]?.filename || null,
      logo: req.files?.logo?.[0]?.filename || null,
      status,
    });
    let taxcard = req.files?.taxcard?.[0]?.filename || null;
    let logo = req.files?.logo?.[0]?.filename || null;
    if (error) {
      deleteFile(taxcard, logo);
      return res.status(400).json({ message: error.message });
    }
    const doc = await Vendor.create(value);
    const doc2 = await Upload.create({
      fileId: req.files.taxcard[0].filename,
      fileName: req.files.taxcard[0].originalname,
    });
    const doc3 = await Upload.create({
      fileId: req.files.logo[0].filename,
      fileName: req.files.logo[0].originalname,
    });
    res.json({ vendor: doc, textcard: doc2, logo: doc3 });
  } catch (error) {
    if (error.code === 11000) {
      let taxcard = req.files?.taxcard?.[0]?.filename || null;
      let logo = req.files?.logo?.[0]?.filename || null;
      deleteFile(taxcard, logo);
      return res.status(400).json({ message: "Email already exists" });
    }

    next(error);
  }
};

const loginVendor = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const flag = await vendor.validatePassword(password);
    if (!flag) {
      return res.status(400).json({ message: "Invalid password" });
    }
    return res.json({ message: "Login successful", vendor });
  } catch (error) {
    next(error);
  }
};

const getAllVendors = async (_req, res, next) => {
  try {
    const vendors = await Vendor.find(
      {},
      { password: 0, __v: 0, notifications: 0 }
    );
    return res.json(vendors);
  } catch (error) {
    next(error);
  }
};

const deleteFile = (taxcardId, logoId) => {
  let taxcardPath, logoPath;
  if (taxcardId !== null) {
    taxcardPath = path.join(__dirname, "../uploads", taxcardId);
  }
  if (logoId !== null) {
    logoPath = path.join(__dirname, "../uploads", logoId);
  }
  if (fs.existsSync(taxcardPath)) {
    fs.unlinkSync(taxcardPath);
  }
  if (fs.existsSync(logoPath)) {
    fs.unlinkSync(logoPath);
  }
};

const deleteVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById({ _id: id });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    let taxcardId = vendor.taxcard;
    let logoId = vendor.logo;
    await Upload.findOneAndDelete({ fileId: taxcardId });
    await Upload.findOneAndDelete({ fileId: logoId });
    deleteFile(taxcardId, logoId);
    await Vendor.findByIdAndDelete(id);
    return res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    next(error);
  }
};
const getVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(
      { _id: id },
      { password: 0, __v: 0, notifications: 0 }
    );
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    return res.json({ vendor });
  } catch (error) {
    next(error);
  }
};
export default {
  signupvendor,
  loginVendor,
  getAllVendors,
  deleteVendor,
  getVendor,
};
