import express from "express";
import {
    simulation
} from "../controllers/simulation.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.post("/", simulation);

export { router };