import express from "express";
import AllUsersController from "../controllers/AllUsersController.js";
const router = express.Router();
router.get("/allUsers", AllUsersController.getAllUsers);
export default router;
