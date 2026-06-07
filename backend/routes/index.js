import express from "express";

import { router as authRouter } from "./auth.js";
import { router as creditRouter } from "./credit.js";
import { router as catalogsRouter } from "./catalogs.js";
import { router as userRouter } from "./user.js";
import { router as clientRouter } from "./client.js";
import { router as documentRouter } from "./document.js";
import { router as wizardRouter } from "./wizard.js";

const router = express.Router();

router.use("/auth", authRouter);

router.use("/credits", creditRouter);

router.use("/users", userRouter);
router.use("/me", clientRouter);

router.use("/catalogs", catalogsRouter);

router.use("/documents", documentRouter);

router.use("/wizard", wizardRouter);

export { router };