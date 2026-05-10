import CREDITS_CONFIG from "../config/credits/config.js";
import { getBaseRate } from "./getData.js";

// pasa tasa mensual a anual nominal
export const monthlyToAnnualNominal = (t) => t * 12;

// pasa tasa anual a mensual nominal
export const annualToMonthlyNominal = (a) => a / 12;

// pasa tasa mensual efectiva a anual efectiva
export const monthlyToAnnual = (t) => Math.pow(1 + t, 12) - 1;

// pasa tasa anual efectiva a mensual efectiva
export const annualToMonthly = (a) => Math.pow(1 + a, 1 / 12) - 1;

/**
 * calcula cuota usando sistema frances
 */
export const calculateInstallment = (
    amount,
    monthlyRate,
    termMonthly
) => {
    return amount * (
        monthlyRate /
        (1 - Math.pow(1 + monthlyRate, -termMonthly))
    );
};

/**
 * obtiene ajuste desde tabla/logistica
 */
const getRiskAdjustment = (config, ratio) => {
    if (!Number.isFinite(ratio) || ratio < 0) {
        return 0;
    }

    const table = [...config.tables.estimatedRisk].sort((a, b) => a.maxRatio - b.maxRatio);

    // usamos tabla
    if (config.useEstimatedRiskTable) {
        for (const r of table) {
            if (ratio <= r.maxRatio) {
                return r.adjustment;
            }
        }

        return table.at(-1)?.adjustment ?? 0;
    }

    // usamos ajuste logistico
    const {
        max: MAX_ADJUSTMENT,
        pendiente: K,
        ratio: X0,
    } = config.logisticAdjustmentRisk;

    return MAX_ADJUSTMENT /
        (1 + Math.exp(-K * (ratio - X0)));
};

/**
 * riesgo para consumo
 *
 * ratio:
 * monto / (renta * cuotas)
 */
export const calculateConsumerRisk = (
    type,
    amount,
    termMonthly,
    income
) => {
    const config = CREDITS_CONFIG[type];

    const ratio = amount / (income * termMonthly);

    return getRiskAdjustment(config, ratio);
};

/**
 * riesgo para hipotecario
 *
 * ratio:
 * dividendo / renta
 */
export const calculateMortgageRisk = (
    type,
    installment,
    income
) => {
    const config = CREDITS_CONFIG[type];

    const ratio = installment / income;

    return getRiskAdjustment(config, ratio);
};

/**
 * calculadores por tipo
 */
const RISK_CALCULATORS = {
    consumption: ({
        type,
        amount,
        termMonthly,
        income,
    }) =>
        calculateConsumerRisk(
            type,
            amount,
            termMonthly,
            income
        ),

    mortgage: ({
        type,
        installment,
        income,
    }) =>
        calculateMortgageRisk(
            type,
            installment,
            income
        ),
};

/**
 * calcula la TIR
 */
const calculateIRR = (
    cashFlow,
    guess = 0.01
) => {
    const hasPositive = cashFlow.some(v => v > 0);
    const hasNegative = cashFlow.some(v => v < 0);

    if (!hasPositive || !hasNegative) {
        return null;
    }

    let rate = guess;

    for (let i = 0; i < 50; i++) {
        let f = 0;
        let df = 0;

        cashFlow.forEach((v, t) => {
            const denom = Math.pow(1 + rate, t);

            f += v / denom;
            df -= (t * v) / (denom * (1 + rate));
        });

        if (df === 0) return null;

        const newRate = rate - f / df;

        if (Math.abs(newRate - rate) < 1e-10) {
            return rate;
        }

        rate = newRate;
    }

    return rate;
};

/**
 * calcula CAE real
 */
export const calculateAPR = (
    amount,
    termMonthly,
    installment,
    upfrontCosts = 0,
    monthlyCosts = 0
) => {
    const disbursedAmount = amount - upfrontCosts;

    const realInstallment = installment + monthlyCosts;

    const cashFlows = [disbursedAmount];

    for (let i = 1; i <= termMonthly; i++) {
        cashFlows.push(-realInstallment);
    }

    const monthlyIRR = calculateIRR(cashFlows);

    if (monthlyIRR == null) {
        return null;
    }

    return monthlyToAnnual(monthlyIRR) * 100;
};

export const calculateFinalMonthlyRate = (
    type,
    baseMonthlyRate,
    riskAdjustmentMonthly,
) => {
    const config = CREDITS_CONFIG[type];

    if (!config) return null;

    const ANNUAL_MIN = config.annualInterest.min;

    const ANNUAL_MAX = config.annualInterest.max;

    if (
        ANNUAL_MIN == null ||
        ANNUAL_MAX == null ||
        !Number.isFinite(baseMonthlyRate) ||
        !Number.isFinite(riskAdjustmentMonthly)
    ) {
        return null;
    }

    const monthlyPre = baseMonthlyRate + riskAdjustmentMonthly;

    const annualPre = monthlyToAnnualNominal(monthlyPre);

    const adjustedAnnual = Math.min(
        Math.max(annualPre, ANNUAL_MIN),
        ANNUAL_MAX
    );

    return annualToMonthlyNominal(
        adjustedAnnual
    );
};

/**
 * redondea montos
 */
export const roundAmount = (amount) => {
    if (amount <= 0) return 0;

    const magnitude = Math.pow(10, Math.floor(Math.log10(amount)) - 1);

    return Math.round(amount / magnitude) * magnitude;

};

/**
 * genera montos candidatos
 */
export const generateCandidateAmounts = (
    amount,
    variation = 0.075
) => {
    const min = amount * (1 - variation);
    const max = amount * (1 + variation);

    const candidates = new Set();
    for (
        let i = min;
        i <= max;
        i += (max - min) / 10
    ) {
        candidates.add(roundAmount(i));
    }
    return Array.from(candidates);
};

/**
 * genera plazos candidatos
 */
export const generateCandidateTerms = (
    termMonthly,
    termMin,
    termMax,
    variation = 0.5
) => {
    const min = Math.max(termMin, Math.floor(termMonthly * (1 - variation)));

    const max = Math.min(termMax, Math.ceil(termMonthly * (1 + variation)));


    const terms = [];

    for (let p = min; p <= max; p++) {
        terms.push(p);
    }

    return terms;
};


/**
 * simulacion
 */
export const calculateCS = ({
    type,

    amount,
    termMonthly,
    income,

    itemValue,
    downPayment,

    firstPaymentDate,

    upfrontCosts,
    monthlyCosts,
}) => {
    const config = CREDITS_CONFIG[type];

    if (!config) {
        throw new Error(
            "Tipo de crédito inválido"
        );
    }

    const finalAmount = amount
        ? amount
        : itemValue - downPayment;

    // tasa base
    const baseMonthlyRate = getBaseRate(
        type,
        finalAmount,
        termMonthly
    );

    if (baseMonthlyRate == null) {
        throw new Error(
            "No se encontró una tasa base"
        );
    }

    // cuota preliminar
    const preliminaryInstallment = calculateInstallment(
        finalAmount,
        baseMonthlyRate,
        termMonthly
    );

    // ajuste de riesgo
    const riskAdjustmentMonthly = RISK_CALCULATORS[type]({
        type,
        amount: finalAmount,
        termMonthly,
        income,
        installment: preliminaryInstallment
    });

    // tasa final
    const finalMonthlyRate = calculateFinalMonthlyRate(
        type,
        baseMonthlyRate,
        riskAdjustmentMonthly
    );

    if (
        finalMonthlyRate == null ||
        !Number.isFinite(finalMonthlyRate)
    ) {
        throw new Error(
            "No se pudo calcular la tasa final"
        );
    }

    // cuota real
    const installment = calculateInstallment(
        finalAmount,
        finalMonthlyRate, 
        termMonthly
    );

    if (
        !Number.isFinite(installment)
    ) {
        throw new Error(
            "No se pudo calcular la cuota"
        );
    }

    // cuota con seguros
    const realInstallment = installment + monthlyCosts;

    // validacion hipotecaria
    if (type === "hipotecario") {
        const ratio = realInstallment / income;

        const maxRatio = config.maxDividendIncomeRatio ?? 0.3;

        if (ratio > maxRatio) {
            throw new Error(
                "La renta no soporta el dividendo"
            );
        }
    }

    // CAE
    const APR = calculateAPR(
        finalAmount,
        termMonthly,
        installment,
        upfrontCosts,
        monthlyCosts
    );

    if (
        APR == null ||
        !Number.isFinite(APR)
    ) {
        throw new Error(
            "CAE inválido"
        );
    }
    const annualNominalRate = monthlyToAnnualNominal(finalMonthlyRate);

    // CTC
    const TCC = realInstallment * termMonthly;

    return {
        type,

        amount: finalAmount,
        termMonthly,

        monthlyInstallment: Math.round(realInstallment),
        baseMonthlyInstallment: Math.round(installment),
        monthlyRate: (finalMonthlyRate * 100).toFixed(3),
        annualRate:(annualNominalRate * 100).toFixed(2),

        apr: parseFloat(APR.toFixed(2)), // cae
        tcc: Math.round(TCC), // ctc

        firstPaymentDate: firstPaymentDate,

        upfrontCosts,
        monthlyCosts,
    };
};

/**
 * recomendaciones
 */
export const calculateCR = ({
    type,

    amount,
    termMonthly,
    income,

    itemValue,
    downPayment,

    firstPaymentDate,

    upfrontCosts,
    monthlyCosts,

    sim,
}) => {
    const {
        amount: amountCfg,
        term: termCfg,
        downPayment: downPaymentCfg,
    } = CREDITS_CONFIG[type];

    const currAmount = !!amount
        ? amount
        : itemValue - downPayment;

    const amounts = generateCandidateAmounts(currAmount).filter(
        m => {
            const min = !!amount ? amountCfg.min : itemValue*(1-downPaymentCfg.max);
            const max = !!amount ? amountCfg.max : itemValue*(1-downPaymentCfg.min);
            return m >= min && m <= max;
        }
    );

    const terms = generateCandidateTerms(
        termMonthly,
        termCfg.min,
        termCfg.max
    );

    const res = [];

    for (const m of amounts) {
        for (const p of terms) {
            try {
                const simResult = calculateCS({
                        type,

                        amount: !!amount ? m : undefined,
                        termMonthly: p,
                        income,

                        itemValue,
                        downPayment: !!amount ? undefined : itemValue - m,

                        firstPaymentDate,

                        upfrontCosts,
                        monthlyCosts,
                    });

                if (simResult) {
                    res.push(simResult);
                }
            } catch {
                continue;
            }
        }
    }

    if (res.length === 0) {
        return [];
    }

    const minAPR = res.reduce((a, b) => a.apr < b.apr ? a : b);
    const minTCC = res.reduce((a, b) => a.tcc < b.tcc ? a : b);
    const minInstallment = res.reduce((a, b) => a.monthlyInstallment < b.monthlyInstallment ? a : b);

    const aux = [
        {
            obj: minAPR,
            rec: "Menor CAE",
        },
        {
            obj: minTCC,
            rec: "Menor CTC",
        },
        {
            obj: minInstallment,
            rec: "Menor Cuota",
        }
    ];

    const map = new Map();

    map.set(sim, []);
    for (const { obj, rec } of aux) {
        if (obj === sim) continue;

        if (!map.has(obj)) {
            map.set(obj, [rec]);
        } else {
            map.get(obj).push(rec);
        }
    }
    const finalRes = [];

    for (const [obj, recs] of map.entries()) {
        if (obj === sim) continue;
        obj.rec = recs.join(", ");
        finalRes.push(obj);
    }

    return finalRes;
};