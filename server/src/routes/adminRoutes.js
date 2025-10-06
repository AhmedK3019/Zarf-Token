import adminController from "../controllers/adminController.js";
import express from "express";
const router = express.Router();

router.post("/createAdmin", adminController.createAdmin);

router.post("/loginAdmin", adminController.loginAdmin);

router.get("/getAdmins", adminController.getAdmins);

router.delete("/deleteAdmin/:id", adminController.deleteAdmin);
export default router;
