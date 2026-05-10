import express from "express";
import { catalogs } from "../controllers/catalogs.js";

const router = express.Router();

router.get("/:table", catalogs);

export { router };