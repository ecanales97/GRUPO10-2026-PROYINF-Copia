// ESTAS TABLAS TEBEN TENER LA TNM (TASA NOMINAL MENSUAL / TASA MENSUAL) !!!!!

const BASE_ANNUAL_RATE_TABLES = {};

BASE_ANNUAL_RATE_TABLES["consumption"] = [
    // Amount <= 500,000
    { maxAmount: 500_000, maxTerm: 12, rate: 0.025 },
    { maxAmount: 500_000, maxTerm: 24, rate: 0.027 },
    { maxAmount: 500_000, maxTerm: 36, rate: 0.029 },
    { maxAmount: 500_000, maxTerm: 48, rate: 0.031 },
    { maxAmount: 500_000, maxTerm: Infinity, rate: 0.033 },

    // Amount <= 1,500,000
    { maxAmount: 1_500_000, maxTerm: 12, rate: 0.020 },
    { maxAmount: 1_500_000, maxTerm: 24, rate: 0.022 },
    { maxAmount: 1_500_000, maxTerm: 36, rate: 0.024 },
    { maxAmount: 1_500_000, maxTerm: 48, rate: 0.026 },
    { maxAmount: 1_500_000, maxTerm: Infinity, rate: 0.028 },

    // Amount <= 3,000,000
    { maxAmount: 3_000_000, maxTerm: 12, rate: 0.018 },
    { maxAmount: 3_000_000, maxTerm: 24, rate: 0.020 },
    { maxAmount: 3_000_000, maxTerm: 36, rate: 0.022 },
    { maxAmount: 3_000_000, maxTerm: 48, rate: 0.024 },
    { maxAmount: 3_000_000, maxTerm: Infinity, rate: 0.026 },

    // Amount <= 6,000,000
    { maxAmount: 6_000_000, maxTerm: 12, rate: 0.015 },
    { maxAmount: 6_000_000, maxTerm: 24, rate: 0.017 },
    { maxAmount: 6_000_000, maxTerm: 36, rate: 0.019 },
    { maxAmount: 6_000_000, maxTerm: 48, rate: 0.021 },
    { maxAmount: 6_000_000, maxTerm: Infinity, rate: 0.023 },

    // Amount > 6,000,000
    { maxAmount: Infinity, maxTerm: 12, rate: 0.013 },
    { maxAmount: Infinity, maxTerm: 24, rate: 0.015 },
    { maxAmount: Infinity, maxTerm: 36, rate: 0.017 },
    { maxAmount: Infinity, maxTerm: 48, rate: 0.019 },
    { maxAmount: Infinity, maxTerm: Infinity, rate: 0.021 },
];

BASE_ANNUAL_RATE_TABLES["mortgage"] = [
    // Amount <= 70M
    { maxAmount: 70_000_000, maxTerm: 120, rate: 0.045 },
    { maxAmount: 70_000_000, maxTerm: 240, rate: 0.047 },
    { maxAmount: 70_000_000, maxTerm: 360, rate: 0.049 },
    { maxAmount: 70_000_000, maxTerm: Infinity, rate: 0.051 },

    // Amount <= 140M
    { maxAmount: 140_000_000, maxTerm: 120, rate: 0.042 },
    { maxAmount: 140_000_000, maxTerm: 240, rate: 0.044 },
    { maxAmount: 140_000_000, maxTerm: 360, rate: 0.046 },
    { maxAmount: 140_000_000, maxTerm: Infinity, rate: 0.048 },

    // Amount <= 280M
    { maxAmount: 280_000_000, maxTerm: 120, rate: 0.040 },
    { maxAmount: 280_000_000, maxTerm: 240, rate: 0.042 },
    { maxAmount: 280_000_000, maxTerm: 360, rate: 0.044 },
    { maxAmount: 280_000_000, maxTerm: Infinity, rate: 0.046 },

    // Amount > 280M (infinito)
    { maxAmount: Infinity, maxTerm: 120, rate: 0.038 },
    { maxAmount: Infinity, maxTerm: 240, rate: 0.040 },
    { maxAmount: Infinity, maxTerm: 360, rate: 0.042 },
    { maxAmount: Infinity, maxTerm: Infinity, rate: 0.044 },
];

Object.keys(BASE_ANNUAL_RATE_TABLES).forEach(type => {
    BASE_ANNUAL_RATE_TABLES[type].sort((a, b) => {
        if (a.maxAmount !== b.maxAmount) return a.maxAmount - b.maxAmount;
        return a.maxTerm - b.maxTerm;
    });
});

export default BASE_ANNUAL_RATE_TABLES;