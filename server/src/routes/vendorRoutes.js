import express from "express";
import vendorController from "../controllers/vendorController.js";
import upload from "../middleware/upload.js";
const router = express.Router();

router.post(
  "/signupvendor",
  upload.fields([
    { name: "taxcard", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  vendorController.signupvendor
);

router.post("/loginvendor", vendorController.loginVendor);

router.get("/getvendors", vendorController.getAllVendors);

router.delete("/deletevendor/:id", vendorController.deleteVendor);
export default router;
