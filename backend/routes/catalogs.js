import express from "express";
import {
    catalogs,
    catalogsAll,
} from "../controllers/catalogs.js";

const router = express.Router();

router.get("/:table", catalogs);
router.get("/", catalogsAll);

export { router };