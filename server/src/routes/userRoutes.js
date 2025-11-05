import userController from "../controllers/userController.js";
import express from "express";
const router = express.Router();

router.post("/signup", userController.signup);

router.post("/login", userController.loginUser);

router.get("/getUsers", userController.getUsers);

router.get("/getUser/:id", userController.getUser);

router.get("/getFavourites/:id", userController.getUserFavourites);

router.post("/addFavourite/:id", userController.addFavourite);

router.post("/removeFavourite/:id", userController.removeFavourite);

router.delete("/deleteUser/:id", userController.deleteUser);

router.get("/getProfessors", userController.getProfessors);

export default router;
