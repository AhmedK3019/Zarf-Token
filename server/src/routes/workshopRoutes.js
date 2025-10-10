import worshopsController from "../controllers/worshopsController.js";
import express from "express";
const router = express.Router();

router.post("/createWorkshop", worshopsController.createWorkshop);

router.get("/getAllWorkshops", worshopsController.getAllWorkshops);

router.get("/getWorkshop/:id", worshopsController.getWorkshop);

router.put("/updateWorkshop/:id", worshopsController.updateWorkshop);

router.delete("/deleteWorkshop/:id", worshopsController.deleteWorkshop);

export default router;
