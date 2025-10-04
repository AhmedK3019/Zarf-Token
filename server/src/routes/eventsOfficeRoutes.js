import eventsController from "../controllers/eventsOfficeController.js";
import express from "express";
const router = express.Router();

router.post("/createEventOffice", eventsController.createEventOffice);

router.post("/loginEventOffice", eventsController.eventOfficeLogin);

export default router;
