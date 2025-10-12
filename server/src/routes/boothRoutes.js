import express from "express";
import {
  createBooth,
  getBooths,
  getBooth,
  getBoothsByBazarId,
  getAllBazarsBooths,
  getAllPlatformBooths,
  updateBooth,
  deleteBooth,
  getMyBooths,
} from "../controllers/boothController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/", createBooth);
router.get("/", getBooths);
router.get("/my-booths", getMyBooths);
router.get("/bazaars", getAllBazarsBooths);
router.get("/platform", getAllPlatformBooths);
router.get("/:bazaarId", getBoothsByBazarId);
router.get("/:id", getBooth);
router.put("/:id", updateBooth);
router.delete("/:id", deleteBooth);

export default router;