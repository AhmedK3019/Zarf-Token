import express from "express";
import AllUsersController from "../controllers/AllUsersController.js";
const router = express.Router();
router.get("/allUsers", AllUsersController.getAllUsers);
router.get("/allAdminsAndOfficers", AllUsersController.getAllAdminsAndOfficers);
router.post("/login", AllUsersController.loginUser);
export default router;
