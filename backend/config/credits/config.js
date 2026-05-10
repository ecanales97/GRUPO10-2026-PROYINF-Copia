import ESTIMATED_RISK_TABLES from "./estimatedRiskTables.js";
import BASE_ANNUAL_RATE_TABLES from "./baseAnnualRateTables.js";

// CONFIGURACION Y PARAMETROS DE LOS CREDITOS

const BASE_CREDITS_CONFIG = {
    consumption: {  // CONSUMO
        meta: {
            label: "Consumo",
            fullName: "Crédito de consumo",
            path: "consumo",
        },

        // PLAZO (MESES)
        term: {
            min: 2,
            max: 60,
        },

        // MONTO
        amount: {
            min: 10_000,
            max: 100_000_000,
        },

        // PRIMER PAGO (MESES)
        gracePeriodMonths: {
            min: 1,
            max: 3,
        },

        // INTERES ANUAL
        annualInterest: {
            min: 0.05,
            max: 0.45,
        },

        // RIESGO ESTIMADO (SIMULACION)
        useEstimatedRiskTable: true,
        
        logisticAdjustmentRisk: {
            max: 0.180,
            slope: 30,
            ratio: 0.22,
        }
    },
    mortgage: {     // HIPOTECARIO
        meta: {
            label: "Hipotecario",
            fullName: "Crédito hipotecario",
            path: "hipotecario",
        },

        // PLAZO (MESES)
        term: {
            min: 60,
            max: 480,
        },

        // PIE (%)
        downPayment: {
            min: 0.05,
            max: 0.55,
        },

        // PROPIEDAD
        propertyValue: {
            min: 25_000_000,
            max: 500_000_000,
        },

        // PRIMER PAGO (MESES)
        gracePeriodMonths: {
            min: 1,
            max: 6,
        },

        // INTERES ANUAL
        annualInterest: {
            min: 0.03,
            max: 0.06,
        },

        // RIESGO ESTIMADO (SIMULACION)
        useEstimatedRiskTable: true,
        
        logisticAdjustmentRisk: {
            max: 0.180,
            slope: 30,
            ratio: 0.22,
        }
    },
}

// mete las tablas
const CREDITS_CONFIG = Object.fromEntries(
    Object.entries(BASE_CREDITS_CONFIG).map(([key, value]) => [
        key,
        {
            ...value,
            ...(value.propertyValue || value.vehicleValue ? { itemValue: value.propertyValue || value.vehicleValue } : {}),
            tables: {
                estimatedRisk: ESTIMATED_RISK_TABLES[key] ?? null,
                baseAnnualRate: BASE_ANNUAL_RATE_TABLES[key] ?? null,
            }
        },
    ])
);

export default CREDITS_CONFIG;