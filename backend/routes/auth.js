import express from "express";
import { register, login, getMe } from "../controllers/auth.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", verifyToken, getMe);

export { router };