import { z } from "zod";

import { validateNationalId } from "../utils/validateData.js";

import {
    calculateCS,
    calculateCR,
} from "../utils/calculateData.js";

import {
    getClientDataByUserId
} from "../utils/getData.js"

import CREDITS_CONFIG from "../config/credits/config.js";

import { validations, objectValidations } from "../shared/schemas/schema.js";

// SCHEMAS

const consumptionSimulationSchema = z.object({
    nationalId: validations.nationalId(),
    useSimplePersonalInformation: validations.useSimplePersonalInformation(),
    income: validations.income(),

    amount: validations.amount(CREDITS_CONFIG.consumption.amount),
    termMonthly: validations.termMonthly(CREDITS_CONFIG.consumption.term),
    firstPaymentDate: validations.firstPaymentDate(CREDITS_CONFIG.consumption.gracePeriodMonths),
});

const mortgageSimulationSchema = z.object({
    nationalId: validations.nationalId(),
    useSimplePersonalInformation: validations.useSimplePersonalInformation(),
    income: validations.income(),

    itemValue: validations.propertyValue(),
    itemType: validations.propertyType(),
    downPayment: validations.downPayment(),
    termMonthly: validations.termMonthly(CREDITS_CONFIG.mortgage.term),
    rateType: validations.rateType(),
    firstPaymentDate: validations.firstPaymentDate(CREDITS_CONFIG.mortgage.gracePeriodMonths),
});

export const simulation = async (
    req,
    res
) => {
    try {
        const { creditType } = req.params;

        // PREP

        const schemas = {
            consumption:
                objectValidations.useSimplePersonalInformation()(
                    consumptionSimulationSchema
                ),
            mortgage:
                objectValidations.downPayment(CREDITS_CONFIG.mortgage.downPayment)(
                    objectValidations.useSimplePersonalInformation()(
                        mortgageSimulationSchema
                    )
                ),
        };

        let clientData = null;
        if (req.user?.sub) {
            clientData = await getClientDataByUserId(
                req.user.sub
            );
        }
        const simulationData = {
            ...req.body,

            nationalId:
                req.body.nationalId ||
                clientData?.nationalId,
            income:
                req.body.income ||
                0,
        };

        // VALIDATE

        const schema = schemas[creditType];
        if (!schema) {
            return res.status(400).json({
                error:
                    "Tipo de crédito inválido.",
            });
        }
        const parsed = schema.safeParse(simulationData);
        if (!parsed.success) {
            console.log(parsed.error);
            return res.status(400).json({
                error:
                    "Datos inválidos.",
                fields:
                    parsed.error.flatten(),
            });
        }
        const data = parsed.data;

        // NATIONAL ID (rut)

        if (
            data.nationalId &&
            !(await validateNationalId(data.nationalId))
        ) {
            return res.status(400).json({
                error:
                    "Rut ingresado no pertenece a una persona real.",
            });
        }

        // PREP

        // hay que meter esto para lo de los seguros y eso lol
        let upfrontCosts = 0;
        let monthlyCosts = 0;
        
        // CALC

        let sim;
        let rec;

        try {
            sim = calculateCS({
                type: creditType,

                amount: data.amount,
                termMonthly: data.termMonthly,
                income: data.income,

                itemValue: data.itemValue,
                downPayment: data.downPayment,

                firstPaymentDate: data.firstPaymentDate,

                upfrontCosts: upfrontCosts,
                monthlyCosts: monthlyCosts,
            });

            rec = calculateCR({
                type: creditType,

                amount: data.amount,
                termMonthly: data.termMonthly,
                income: data.income,

                itemValue: data.itemValue,
                downPayment: data.downPayment,

                firstPaymentDate: data.firstPaymentDate,

                upfrontCosts: upfrontCosts,
                monthlyCosts: monthlyCosts,

                sim,
            });

        } catch (e) {
            console.error(e);
            return res.status(500).json({
                error:
                    `Error en la simulación: ${e.message}`,
            });
        }

        return res.json({
            options: [
                sim,
                ...rec
            ],
        });

    } catch (e) {
        console.error(e);

        return res.status(500).json({
            error:
                `Error con datos ingresados: ${e.message}`,
        });
    }
};