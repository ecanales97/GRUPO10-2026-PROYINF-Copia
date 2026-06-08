import CREDITS_CONFIG from "../config/credits/config.js";
import { db } from "./db.js";
import Cache from "./cache.js";

export const getRoleId = async (code) => {
    const role = await Cache.getByCode("userRoles", code);
    if (!role) throw new Error("Rol de usuario no válido");
    return role.id;
};

export const getUserByEmail = async (email) => {
    const { rows } = await db.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );
    return rows[0] || null;
};

export const getClientDataByUserId = async (userId) => {
    const { rows } = await db.query(`
        SELECT 
            u.id,
            u.name,
            u.nickname,
            u.email,
            u.phone,
            u.roleId,

            c.id as clientId,
            c.userId,
            c.nationalId,
            c.birthDate,
            c.maritalStatusId,
            c.primaryAddressId,
            c.primaryPaymentMethodId,
            c.primaryDisbursementMethodId

        FROM users u
        LEFT JOIN clients c ON c.userId = u.id
        WHERE u.id = $1
        AND u.deletedAt IS NULL
    `, [userId]);

    return rows[0] || null;
};

export const getClientByNationalId = async (nationalId) => {
    const { rows } = await db.query(`
        SELECT 
            u.id,
            u.name,
            u.nickname,
            u.email,
            u.phone,
            u.roleId,

            c.id as clientId,
            c.userId,
            c.nationalId,
            c.birthDate,
            c.maritalStatusId

        FROM users u
        LEFT JOIN clients c ON c.userId = u.id
        WHERE c.nationalId = $1
        AND u.deletedAt IS NULL
    `, [nationalId]
    );
    return rows[0] || null;
};

/**
 * para obtener la tasa base a partir de la tabla.
 * 
 * - type - tipo de credito
 * - amount - monto del credito
 * - term - numero de cuotas
 */
export const getBaseRate = (
    type,
    amount,
    term
) => {
    const config = CREDITS_CONFIG[type];
    if (!config) return null;

    const baseRateTable = config.tables.baseAnnualRate;
    if (!baseRateTable) return null;

    if (baseRateTable.length === 0) return null;

    for (const rule of baseRateTable) {
        if (amount <= rule.maxAmount && term <= rule.maxTerm) {
            return rule.rate / 12;
        }
    }

    return null;
};

export const getScore = (
    rut
) => {
    return 800;
}

export const getPaymentCapacity = (
    income,
    amount,
    term
) => {
    return 0;
}

// helpers para getCreditsConfig
// helpers para getCreditsConfig
const allowedParams = [
    "amount",
    "term",
    "downPayment",
    "propertyValue",
    "gracePeriodMonths",
];

const pickParams = (config) =>
    Object.fromEntries(
        Object.entries(config).filter(([key]) =>
            allowedParams.includes(key)
        )
    );

/**
 * agrega datos enriquecidos (cache)
 */
const buildParameters = (config) => ({
    ...pickParams(config),
    ...(config.creditItems?.length
        ? { creditItems: config.creditItems }
        : {}),

    ...(config.rateTypes?.length
        ? { rateTypes: config.rateTypes }
        : {}),

    ...(config.creditType
        ? { creditType: config.creditType }
        : {}),

    ...(config.insuranceTypes
        ? { insuranceTypes: config.insuranceTypes }
        : {}),
});

const buildCreditConfig = (config) => ({
    meta: config.meta ?? {},
    parameters: buildParameters(config),
});

/**
 * devuelve la meta y parametros de los creditos
 */
export const getCreditsConfig = (creditType) => {
    if (creditType) {
        if (!Object.hasOwn(CREDITS_CONFIG, creditType)) return null;
        return buildCreditConfig(CREDITS_CONFIG[creditType]);
    }

    return Object.fromEntries(
        Object.entries(CREDITS_CONFIG).map(([key, value]) => [
            key,
            buildCreditConfig(value),
        ])
    );
};

export const getAuthenticatedUser = async (req) => {
    const token = req.cookies.token;

    if (!token) {
        throw new Error("NO_SESSION");
    }

    const decoded = jwt.verify(token, SECRET);

    const { rows } = await db.query(`
        SELECT id, deletedAt
        FROM users
        WHERE id = $1
    `, [decoded.sub]);

    if (!rows.length || rows[0].deletedat) {
        throw new Error("INVALID_USER");
    }

    return decoded;
};