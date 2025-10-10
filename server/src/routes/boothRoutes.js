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
} from "../controllers/boothController.js";

const router = express.Router();

router.post("/", createBooth);
router.get("/", getBooths);
router.get("/:bazaarId", getBoothsByBazarId);
router.get("/bazaars", getAllBazarsBooths);
router.get("/platform", getAllPlatformBooths);
router.get("/:id", getBooth);
router.put("/:id", updateBooth);
router.delete("/:id", deleteBooth);

export default router;
