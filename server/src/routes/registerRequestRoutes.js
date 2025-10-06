import registerRequestController from "../controllers/registerRequestController.js";
import express from "express";
const router = express.Router();

router.get(
  "/getAllRegisterRequests",
  registerRequestController.getAllRegisterRequests
);
router.delete(
  "/deleteRegisterRequest/:id",
  registerRequestController.deleteRegisterRequest
);
router.patch(
  "/updateRegisterRequest/:id",
  registerRequestController.updateRegisterRequest
);
export default router;
