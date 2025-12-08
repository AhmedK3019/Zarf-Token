import worshopsController from "../controllers/worshopsController.js";
import express from "express";
const router = express.Router();

router.post("/createWorkshop", worshopsController.createWorkshop);
router.post("/payForWorkshop/:id", worshopsController.payForWorkshop);

router.get("/getAllWorkshops", worshopsController.getAllWorkshops);

router.get("/getWorkshop/:id", worshopsController.getWorkshop);

router.put("/updateWorkshop/:id", worshopsController.updateWorkshop);

router.delete("/deleteWorkshop/:id", worshopsController.deleteWorkshop);

router.patch(
  "/registerForaWorkshop/:id",
  worshopsController.registerForWorkshop
);
router.patch("/cancelRegistration/:id", worshopsController.cancelRegistration);
router.patch(
  "/updateWorkshopStatus/:id",
  worshopsController.updateWorkshopStatus
);
router.get("/getMyWorkshops", worshopsController.getMyWorkshops);

router.patch("/requestEdits/:id", worshopsController.requestEdits);
router.post("/acceptEdits/:id", worshopsController.acceptEdits);
router.post("/rejectEdits/:id", worshopsController.rejectEdits);
router.post("/askToBeNotified/:id", worshopsController.askToBeNotified);
// router.patch("/setAllowedRoles/:id", worshopsController.setAllowedRoles);
export default router;
