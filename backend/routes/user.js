import express from "express";
import {
    getUser,
    updateUser,
    deleteUser
} from "../controllers/user.js";

import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", verifyToken, getUser);
router.patch("/me", verifyToken, updateUser);
router.delete("/me", verifyToken, deleteUser);

export { router };