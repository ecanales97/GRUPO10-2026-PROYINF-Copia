import Cache from "../../utils/cache.js";
import ESTIMATED_RISK_TABLES from "./estimatedRiskTables.js";
import BASE_ANNUAL_RATE_TABLES from "./baseAnnualRateTables.js";

const toKey = (str) => str?.toLowerCase?.() ?? "";

const BASE_CREDITS_CONFIG = {
    consumption: {
        meta: {
            label: "Consumo",
            fullName: "Crédito de consumo",
            path: "consumo",
        },

        term: { min: 2, max: 60 },
        amount: { min: 10_000, max: 100_000_000 },
        gracePeriodMonths: { min: 1, max: 3 },
        annualInterest: { min: 0.05, max: 0.45 },

        useEstimatedRiskTable: true,

        logisticAdjustmentRisk: {
            max: 0.180,
            slope: 30,
            ratio: 0.22,
        }
    },

    mortgage: {
        meta: {
            label: "Hipotecario",
            fullName: "Crédito hipotecario",
            path: "hipotecario",
        },

        term: { min: 60, max: 480 },
        downPayment: { min: 0.05, max: 0.55 },
        propertyValue: { min: 25_000_000, max: 500_000_000 },
        gracePeriodMonths: { min: 1, max: 6 },
        annualInterest: { min: 0.03, max: 0.06 },

        useEstimatedRiskTable: true,

        logisticAdjustmentRisk: {
            max: 0.180,
            slope: 30,
            ratio: 0.22,
        }
    },
};

const enrichCreditConfig = async (configMap) => {
    const creditTypes = await Cache.getAll("creditTypes");
    
    const creditItems = await Cache.getAll("creditItems");

    const rateTypes = await Cache.getAll("rateTypes");
    const creditRateTypes = await Cache.getAll("creditRateTypes");

    const insuranceTypes = await Cache.getAll("insuranceTypes");
    const creditInsuranceTypes = await Cache.getAll("creditInsuranceTypes");

    const creditTypeByCode = Object.fromEntries(
        creditTypes.map(ct => [ct.code, ct])
    );

    const rateTypeById = Object.fromEntries(
        rateTypes.map(rt => [rt.id, rt])
    );

    const insuranceTypeById = Object.fromEntries(
        insuranceTypes.map(it => [it.id, it])
    );

    return Object.fromEntries(
        Object.entries(configMap).map(([key, cfg]) => {
            const code = key.toUpperCase();

            const creditType = creditTypeByCode[code];

            const items = creditItems
                .filter(i => i.credittypeid === creditType?.id)
                .map(i => ({
                    value: String(i.id),
                    label: String(i.name),

                    ...i
                }));

            const rateLinks = creditRateTypes
                .filter(r => r.credittypeid === creditType?.id);

            const allowedRateTypes = rateLinks
                .map(r => {
                    const rt = rateTypeById[r.ratetypeid];
                    if (!rt) return null;

                    return {
                        value: String(rt.id),
                        label: String(rt.name),

                        isdefault: r.isdefault,

                        ...rt
                    };
                })
                .filter(Boolean);

            const insuranceLinks = creditInsuranceTypes
                .filter(i => i.credittypeid === creditType?.id);

            const allowedInsuranceTypes = insuranceLinks
                .map(i => {
                    const insurance = insuranceTypeById[i.insurancetypeid];

                    if (!insurance) return null;

                    return {
                        value: String(insurance.id),
                        label: String(insurance.name),

                        isrequired: i.isrequired,

                        ...insurance
                    };
                })
                .filter(Boolean);

            return [
                key,
                {
                    ...cfg,

                    creditType: creditType ?? null,

                    creditItems: items,
                    rateTypes: allowedRateTypes,
                    insuranceTypes: allowedInsuranceTypes,

                    tables: {
                        estimatedRisk:
                            ESTIMATED_RISK_TABLES[key] ?? null,
                        baseAnnualRate:
                            BASE_ANNUAL_RATE_TABLES[key] ?? null,
                    }
                }
            ];
        })
    );
};
const CREDITS_CONFIG = await enrichCreditConfig(BASE_CREDITS_CONFIG);

export default CREDITS_CONFIG;