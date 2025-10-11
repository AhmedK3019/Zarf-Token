import express from "express";
import AllUsersController from "../controllers/AllUsersController.js";
const router = express.Router();
router.get("/allUsers", AllUsersController.getAllUsers);
router.put(
  "/:id/notifications/:notifId/read",
  AllUsersController.setNotificationRead
);
router.delete("/:id", AllUsersController.deleteUserById);
router.get("/allAdminsAndOfficers", AllUsersController.getAllAdminsAndOfficers);
router.get("/:id", AllUsersController.getUserById);
router.post("/login", AllUsersController.loginUser);
export default router;
