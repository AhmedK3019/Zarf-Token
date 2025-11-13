import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadFile,
  getFiles,
  getFile,
  getFileByFileId,
  deleteFile,
} from "../controllers/uploadController.js";

const router = express.Router();

router.post("/", upload.single("file"), uploadFile);
router.get("/", getFiles);
router.get("/:id", getFile);
router.get("/fileId/:fileId", getFileByFileId);
router.delete("/:id", deleteFile);

export default router;
