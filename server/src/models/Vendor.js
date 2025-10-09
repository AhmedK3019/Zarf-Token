import moongoose from "mongoose";
import bcrypt from "bcryptjs";
const vendorSchema = new moongoose.Schema({
  companyname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  taxcard: { type: String, required: true },
  logo: { type: String, required: true },
  status: { type: String, enum: ["Active", "Blocked"], default: "Active" },
  role: { type: String, default: "Vendor" },
});

vendorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  } else {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

vendorSchema.methods.validatePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Vendor = moongoose.model("Vendor", vendorSchema);
export default Vendor;
