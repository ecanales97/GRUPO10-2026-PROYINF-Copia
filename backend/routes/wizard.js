import express from "express";

import { createWizardRouter, createWizardStore, registry } from "../controllers/wizard.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

import { validations } from "../shared/schemas/schema.js";
import { db } from "../utils/db.js";
import { z } from "zod";
import { scanner } from "../utils/documents.js";
import { getOptions } from "../utils/cache.js";
import { createClientEmployment, createClientIncome } from "../controllers/client.js";

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
            await createClientIncome({ userId: req.user.sub, formData: formData });
        },
    }
};

const router = express.Router();
router.use("/", verifyToken, createWizardRouter({ wizards }));
export { router };