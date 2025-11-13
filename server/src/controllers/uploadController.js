import Upload from "../models/Upload.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Use absolute path to the uploads directory (server/src/uploads)
const uploadsDir = path.join(__dirname, "..", "uploads");

// Create upload (multer handles the actual file writing)
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileId = req.file.filename; // saved filename (id.pdf)
    const fileName = req.file.originalname; // original uploaded name

    const upload = new Upload({ fileId, fileName });
    await upload.save();

    res.status(201).json(upload);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all uploaded files
export const getFiles = async (req, res) => {
  const files = await Upload.find();
  res.json(files);
};

// Get a specific file (download)
export const getFile = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) return res.status(404).json({ error: "File not found" });

    const filePath = path.join(uploadsDir, upload.fileId);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    res.download(filePath, upload.fileName); // sends as download
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getFileByFileId = async (req, res) => {
  try {
    const upload = await Upload.findOne({ fileId: req.params.fileId });
    if (!upload) return res.status(404).json({ error: "File not found" });
    const filePath = path.join(uploadsDir, upload.fileId);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }
    // Serve inline if it's an image so it can be displayed directly in <img src="..." /> tags
    const ext = path.extname(upload.fileId).toLowerCase();
    const imageTypes = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    };
    const contentType = imageTypes[ext];
    if (contentType) {
      res.setHeader("Content-Type", contentType);
      // Optional caching (tweak max-age as needed)
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.sendFile(path.resolve(filePath));
    }
    // Fallback: non-image files still downloaded
    res.download(filePath, upload.fileName);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete file
export const deleteFile = async (req, res) => {
  try {
    const upload = await Upload.findByIdAndDelete(req.params.id);
    if (!upload) return res.status(404).json({ error: "File not found" });

    const filePath = path.join("uploads", upload.fileId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // delete from filesystem
    }

    res.json({ message: "File deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
