import bazaarController from "../controllers/bazaarController.js";
import express from "express";

const router = express.Router();

router.post("/createBazaar", bazaarController.createBazaar);
router.get("/getAllBazaars", bazaarController.getAllBazaars);
router.get("/getBazaar/:id", bazaarController.getBazaar);
router.put("/updateBazaar/:id", bazaarController.updateBazaar);
router.delete("/deleteBazaar/:id", bazaarController.deleteBazaar);

export default router;
