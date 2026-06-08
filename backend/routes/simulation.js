import express from "express";
import {
    simulation
} from "../controllers/simulation.js";
import { softVerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.post("/", softVerifyToken, simulation);

export { router };