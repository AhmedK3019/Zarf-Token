import express from "express";
import {
  createForm,
  getForms,
  getForm,
  deleteForm,
} from "../controllers/loyaltyProgramFormController.js";

const router = express.Router();

router.post("/", createForm); // create new form
router.get("/", getForms); // get all forms
router.get("/:id", getForm); // get one form by id
router.delete("/:id", deleteForm); // delete form

export default router;
