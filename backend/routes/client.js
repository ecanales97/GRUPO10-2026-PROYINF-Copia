import express from "express";
import {
    getClient,
    updateClient,
    deleteClient,

    // INCOME
    getClientIncome,
    createClientIncome,
    updateClientIncome,
    deleteClientIncome,

    // EMPLOYMENT
    getClientEmployment,
    createClientEmployment,
    updateClientEmployment,
    deleteClientEmployment,

    // ASSETS
    getClientAssets,
    createClientAsset,
    updateClientAsset,
    deleteClientAsset,

    // LIABILITIES
    getClientLiabilities,
    createClientLiability,
    updateClientLiability,
    deleteClientLiability

} from "../controllers/client.js";

import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// CLIENT
router.get("/me", verifyToken, getClient);
router.patch("/me", verifyToken, updateClient);
router.delete("/me", verifyToken, deleteClient);

// INCOME
router.get("/income", verifyToken, getClientIncome);
router.post("/income", verifyToken, createClientIncome);
router.patch("/income/:id", verifyToken, updateClientIncome);
router.delete("/income/:id", verifyToken, deleteClientIncome);

// EMPLOYMENT
router.get("/employment", verifyToken, getClientEmployment);
router.post("/employment", verifyToken, createClientEmployment);
router.patch("/employment/:id", verifyToken, updateClientEmployment);
router.delete("/employment/:id", verifyToken, deleteClientEmployment);

// ASSETS
router.get("/assets", verifyToken, getClientAssets);
router.post("/assets", verifyToken, createClientAsset);
router.patch("/assets/:id", verifyToken, updateClientAsset);
router.delete("/assets/:id", verifyToken, deleteClientAsset);

// LIABILITIES
router.get("/liabilities", verifyToken, getClientLiabilities);
router.post("/liabilities", verifyToken, createClientLiability);
router.patch("/liabilities/:id", verifyToken, updateClientLiability);
router.delete("/liabilities/:id", verifyToken, deleteClientLiability);

export { router };