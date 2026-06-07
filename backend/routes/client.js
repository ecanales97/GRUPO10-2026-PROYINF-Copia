import express from "express";

import {
    // CLIENT DATA
    getMeAll,

    // CLIENT
    getClient,
    deleteClient,

    // CONFIG
    updateClientIdentity,
    updateClientContact,
    updateClientPassword,

    // INCOME
    getClientIncome,
    deleteClientIncome,

    // EMPLOYMENT
    getClientEmployment,
    deleteClientEmployment,

    // ASSETS
    getClientAssets,
    deleteClientAsset,

    // PAYMENT
    getClientPaymentMethods,
    deleteClientPaymentMethod,

    // DISBURSMENT
    getClientDisbursementMethods,
    deleteClientDisbursementMethod,

} from "../controllers/client.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { confirmPassword } from "../middlewares/confirmPasswordMiddleware.js";

const router = express.Router();

// CLIENT DATA
router.get("/all", verifyToken, getMeAll);

// CLIENT
router.get("/", verifyToken, getClient);
router.delete("/", verifyToken, confirmPassword, deleteClient);

// CONFIG
router.patch("/identity", verifyToken, confirmPassword, updateClientIdentity);
router.patch("/contact", verifyToken, confirmPassword, updateClientContact);
router.patch("/password", verifyToken, confirmPassword, updateClientPassword);

// INCOME
router.get("/income", verifyToken, getClientIncome);
router.delete("/income/:id", verifyToken, deleteClientIncome);

// EMPLOYMENT
router.get("/employment", verifyToken, getClientEmployment);
router.delete("/employment/:id", verifyToken, deleteClientEmployment);

// ASSETS
router.get("/assets", verifyToken, getClientAssets);
router.delete("/assets/:id", verifyToken, deleteClientAsset);

// PAYMENT
router.get("/payment", verifyToken, getClientPaymentMethods);
router.delete("/payment/:id", verifyToken, deleteClientPaymentMethod);

// DISBURSMENT
router.get("/disbursment", verifyToken, getClientDisbursementMethods);
router.delete("/disbursment/:id", verifyToken, deleteClientDisbursementMethod);

export { router };