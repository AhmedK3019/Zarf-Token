import userController from "../controllers/userController.js";
import express from "express";
const router = express.Router();

router.post("/signup", userController.signup);

router.post("/login", userController.loginUser);

router.get("/getUsers", userController.getUsers);

router.get("/getUser/:id", userController.getUser);

router.delete("/deleteUser/:id", userController.deleteUser);

export default router;
