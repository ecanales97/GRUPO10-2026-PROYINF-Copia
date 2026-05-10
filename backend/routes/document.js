import express from "express";
import multer from "multer";

import { document } from "../controllers/document.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = express.Router();

// CLIENT
router.post("/:documentType", upload.single("file"), document);

export { router };