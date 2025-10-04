import Vendor from "../models/Vendor.js";
import Upload from "../models/Upload.js";
import Joi from "joi";

const vendorSchema = Joi.object({
  companyname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  taxcard: Joi.string().required(),
  logo: Joi.string().required(),
});

const signupvendor = async (req, res, next) => {
  try {
    const { companyname, email, password } = req.body;
    const { value, error } = vendorSchema.validate({
      companyname,
      email,
      password,
      taxcard: req.files?.taxcard?.[0]?.filename || null,
      logo: req.files?.logo?.[0]?.filename || null,
    });
    if (error) {
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

export default { signupvendor, loginVendor };
