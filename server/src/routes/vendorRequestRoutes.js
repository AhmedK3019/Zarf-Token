import express from "express";
import vendorRequestController from "../controllers/vendorRequestController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Bazaar request: vendor posts people and boothSize, bazarId from URL
router.post(
  "/bazar/:bazarId",
  auth,
  vendorRequestController.createBazarRequest
);

// Platform request: vendor posts people, duration, location and boothSize
router.post("/platform", auth, vendorRequestController.createPlatformRequest);

// CRUD
router.get("/", vendorRequestController.getRequests);
router.get("/mine", auth, vendorRequestController.getMyRequests);
router.get("/:id", vendorRequestController.getRequest);
router.put("/:id", auth, vendorRequestController.updateRequest);
router.delete("/:id", auth, vendorRequestController.deleteRequest);

export default router;
