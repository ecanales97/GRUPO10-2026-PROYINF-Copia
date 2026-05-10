import express from "express";
import { creditsConfig } from "../controllers/credit.js";
import { router as simulationRouter } from "./simulation.js";

const router = express.Router();
const routerCreditType = express.Router({ mergeParams: true });

routerCreditType.get("/", creditsConfig);
routerCreditType.use("/simulation", simulationRouter);

router.use("/:creditType", routerCreditType);
router.get("/", creditsConfig);

export { router };