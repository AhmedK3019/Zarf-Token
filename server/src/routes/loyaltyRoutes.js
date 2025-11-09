import express from "express";
import {
  createForm,
  getForms,
  getForm,
  deleteForm,
  checkPromoCode,
} from "../controllers/loyaltyController.js";

const router = express.Router();

router.post("/", createForm); // create new form
router.get("/", getForms); // get all/forms with filters
router.get("/check-code/:promoCode", checkPromoCode); // promo uniqueness lookup
router.get("/:id", getForm); // get one form by id
router.delete("/:id", deleteForm); // delete form

export default router;
