import express from "express";
import {
  createForm,
  getForms,
  getForm,
  deleteForm,
} from "../controllers/loyaltyController.js";

const router = express.Router();

router.post("/", createForm); // create new form
router.get("/", getForms); // get all/forms with filters
router.get("/:vendorId", getForm); // get one form by vendorId
router.delete("/:vendorId", deleteForm); // delete form

export default router;
