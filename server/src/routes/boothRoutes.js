import express from "express";
import {
  createBooth,
  getBooths,
  getBooth,
  updateBooth,
  deleteBooth,
} from "../controllers/boothController.js";

const router = express.Router();

router.post("/", createBooth);
router.get("/", getBooths);
router.get("/:id", getBooth);
router.put("/:id", updateBooth);
router.delete("/:id", deleteBooth);

export default router;
