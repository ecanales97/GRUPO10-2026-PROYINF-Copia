import express from "express";

import { createWizardRouter, createWizardStore, registry } from "../controllers/wizard.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

import { validations } from "../shared/schemas/schema.js";
import { db } from "../utils/db.js";
import { z } from "zod";
import { scanner } from "../utils/documents.js";
import { getOptions } from "../utils/cache.js";
import { createClientAddress, createClientAsset, createClientEmployment, createClientIncome } from "../controllers/client.js";
import { verifyCurrentPassword } from "../utils/validateData.js";

const schemas = {
    employmentDocument: z.object({
        jobTypeId:      validations.jobType({ options: await getOptions("jobTypes") }).nullable(),
        contractTypeId: validations.contractType({ options: await getOptions("contractTypes") }).nullable(),
        salary:         validations.salary().nullable(),
        startDate:      validations.jobStartDate().nullable(),
    }).nullable().optional(),

    incomeDocument: z.object({
        monthlyIncome:  validations.monthlyIncome().nullable(),
        incomeTypeId:   validations.incomeType({ options: await getOptions("incomeTypes") }).nullable(),
        isRecurring:    validations.isRecurring().nullable(),
    }).nullable().optional(),
    
    addressDocument: z.object({
        address:        validations.address().nullable(),
        commune:        validations.commune().nullable(),
        region:         validations.region().nullable(),
    }).nullable().optional(),

    assetDocument: z.object({
        assetTypeId:            validations.assetType({ options: await getOptions("assetTypes") }).nullable(),
        value:                  validations.assetValue().nullable(),
        ownershipPercentage:    validations.ownershipPercentage().nullable(),
    }).nullable().optional(),
}

const wizards = {
    "create-client-employment": {
        store: createWizardStore({ mode: "DB", db: db }),
        requireClient: true,
        steps: [
            {
                fields: {
                    document:           validations.documentBackend(),
                    scan: {
                        schema:         schemas.employmentDocument,
                        readonly:       true,
                    }
                },
                prevStepComplete: async (formData, req, res, store) => {
                    if (!formData.document || formData.document?.scanned) return;

                    const scan = await scanner.employment(formData.document);
                    await store.update(req.wzdId, {
                        fields: {
                            document: { ...formData.document, scanned: true },
                            scan: {
                                jobTypeId:          scan.jobTypeId,
                                contractTypeId:     scan.contractTypeId,
                                salary:             scan.salary,
                                startDate:          scan.startDate,
                            },
                            jobTypeId:          scan.jobTypeId,
                            contractTypeId:     scan.contractTypeId,
                            salary:             scan.salary,
                            startDate:          scan.startDate,
                        },
                    });
                    await store.get(req.wzdId);
                },
            },
            {
                fields: {
                    jobTypeId:          validations.jobType({ options: await getOptions("jobTypes") }),
                    contractTypeId:     validations.contractType({ options: await getOptions("contractTypes") }),
                    salary:             validations.salary(),
                    startDate:          validations.jobStartDate(),
                },
            },
            {
                fields: {
                    currentPassword:    validations.passwordRequired(),
                },
            },
        ],
        onComplete: async (formData, req, res, store) => {
            await verifyCurrentPassword(req.user.sub, formData.currentPassword);
            await createClientEmployment({ userId: req.user.sub, formData: formData });
        },
    },

    "create-client-income": {
        store: createWizardStore({ mode: "DB", db: db }),
        requireClient: true,
        steps: [
            {
                fields: {
                    document:           validations.documentBackend(),
                    scan: {
                        schema:         schemas.incomeDocument,
                        readonly:       true,
                    }
                },
                prevStepComplete: async (formData, req, res, store) => {
                    if (!formData.document || formData.document?.scanned) return;

                    const scan = await scanner.income(formData.document);
                    await store.update(req.wzdId, {
                        fields: {
                            document: { ...formData.document, scanned: true },
                            scan: {
                                monthlyIncome:      scan.monthlyIncome,
                                incomeTypeId:       scan.incomeTypeId,
                                isRecurring:        scan.isRecurring,
                            },
                            monthlyIncome:      scan.monthlyIncome,
                            incomeTypeId:       scan.incomeTypeId,
                            isRecurring:        scan.isRecurring,
                        },
                    });
                    await store.get(req.wzdId);
                },
            },
            {
                fields: {
                    monthlyIncome:      validations.monthlyIncome(),
                    incomeTypeId:       validations.incomeType({ options: await getOptions("incomeTypes") }),
                    isRecurring:        validations.isRecurring(),
                },
            },
            {
                fields: {
                    currentPassword:    validations.passwordRequired(),
                },
            },
        ],
        onComplete: async (formData, req, res, store) => {
            await verifyCurrentPassword(req.user.sub, formData.currentPassword);
            await createClientIncome({ userId: req.user.sub, formData: formData });
        },
    },

    "create-client-address": {
        store: createWizardStore({ mode: "DB", db: db }),
        requireClient: true,
        steps: [
            {
                fields: {
                    document:           validations.documentBackend(),
                    scan: {
                        schema:         schemas.addressDocument,
                        readonly:       true,
                    }
                },
                prevStepComplete: async (formData, req, res, store) => {
                    if (!formData.document || formData.document?.scanned) return;

                    const scan = await scanner.address(formData.document);
                    await store.update(req.wzdId, {
                        fields: {
                            document: { ...formData.document, scanned: true },
                            scan: {
                                address:            scan.address,
                                commune:            scan.commune,
                                region:             scan.region,
                            },
                            address:            scan.address,
                            commune:            scan.commune,
                            region:             scan.region,
                        },
                    });
                    await store.get(req.wzdId);
                },
            },
            {
                fields: {
                    address:        validations.address(),
                    commune:        validations.commune(),
                    region:         validations.region(),
                },
            },
            {
                fields: {
                    currentPassword:    validations.passwordRequired(),
                },
            },
        ],
        onComplete: async (formData, req, res, store) => {
            await verifyCurrentPassword(req.user.sub, formData.currentPassword);
            await createClientAddress({ userId: req.user.sub, formData: formData });
        },
    },

    
    "create-client-asset": {
        store: createWizardStore({ mode: "DB", db: db }),
        requireClient: true,
        steps: [
            {
                fields: {
                    document:           validations.documentBackend(),
                    scan: {
                        schema:         schemas.assetDocument,
                        readonly:       true,
                    }
                },
                prevStepComplete: async (formData, req, res, store) => {
                    if (!formData.document || formData.document?.scanned) return;

                    const scan = await scanner.asset(formData.document);
                    await store.update(req.wzdId, {
                        fields: {
                            document: { ...formData.document, scanned: true },
                            scan: {
                                assetTypeId:            scan.assetTypeId,
                                value:                  scan.value,
                                ownershipPercentage:    scan.ownershipPercentage,
                                
                            },
                            assetTypeId:            scan.assetTypeId,
                            value:                  scan.value,
                            ownershipPercentage:    scan.ownershipPercentage,
                        },
                    });
                    await store.get(req.wzdId);
                },
            },
            {
                fields: {
                    assetTypeId:            validations.assetType({ options: await getOptions("assetTypes") }),
                    value:                  validations.assetValue(),
                    ownershipPercentage:    validations.ownershipPercentage(),
                },
            },
            {
                fields: {
                    currentPassword:    validations.passwordRequired(),
                },
            },
        ],
        onComplete: async (formData, req, res, store) => {
            await verifyCurrentPassword(req.user.sub, formData.currentPassword);
            await createClientAsset({ userId: req.user.sub, formData: formData });
        },
    }
};

const router = express.Router();
router.use("/", verifyToken, createWizardRouter({ wizards }));
export { router };