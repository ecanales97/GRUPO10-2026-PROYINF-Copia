import { db } from "./db.js";

const TTL = 1000 * 60 * 30;

const TABLES = {
    creditTypes: {
        table: "creditTypes",
        columns: [
            "id",
            "code",
            "name",
            "description",
            "requiresItem"
        ]
    },

    applicationTypes: {
        table: "applicationTypes",
        columns: ["id", "code", "name"]
    },

    transactionTypes: {
        table: "transactionTypes",
        columns: ["id", "code", "name"]
    },

    documentTypes: {
        table: "documentTypes",
        columns: ["id", "code", "name", "description"]
    },

    assetTypes: {
        table: "assetTypes",
        columns: ["id", "code", "name", "description", "riskModifier"]
    },

    incomeTypes: {
        table: "incomeTypes",
        columns: ["id", "code", "name", "description", "riskModifier"]
    },

    liabilityTypes: {
        table: "liabilityTypes",
        columns: ["id", "code", "name", "description"]
    },

    documentSources: {
        table: "documentSources",
        columns: ["id", "code", "name", "description"]
    },

    clientDataSources: {
        table: "clientDataSources",
        columns: ["id", "code", "name", "description"]
    },

    jobTypes: {
        table: "jobTypes",
        columns: ["id", "name", "riskModifier"]
    },

    contractTypes: {
        table: "contractTypes",
        columns: ["id", "code", "name", "description", "riskModifier"]
    },

    auditLogTypes: {
        table: "auditLogTypes",
        columns: ["id", "code", "name", "description"]
    },

    applicationStatus: {
        table: "applicationStatus",
        columns: ["id", "code", "name"]
    },

    creditStatus: {
        table: "creditStatus",
        columns: ["id", "code", "name"]
    },

    creditInstallmentStatus: {
        table: "creditInstallmentStatus",
        columns: ["id", "code", "name"]
    },

    riskLevels: {
        table: "riskLevels",
        columns: ["id", "code", "name"]
    },

    decisions: {
        table: "decisions",
        columns: ["id", "code", "name"]
    },

    userRoles: {
        table: "userRoles",
        columns: ["id", "code", "name", "description"]
    },

    clientMaritalStatus: {
        table: "clientMaritalStatus",
        columns: ["id", "code", "name", "description"]
    },

    rateTypes: {
        table: "rateTypes",
        columns: [
            "id",
            "code",
            "name",
            "description",
            "monthlyRateAdjustment"
        ]
    },

    creditItems: {
        table: "creditItems",
        columns: [
            "id",
            "creditTypeId",
            "code",
            "name",
            "description",
            "riskModifier",
            "maxLTV",
            "maxTermMonths",
            "isActive"
        ]
    },

    creditRateTypes: {
        table: "creditRateTypes",
        columns: [
            "id",
            "creditTypeId",
            "rateTypeId",
            "isDefault"
        ]
    },

    insuranceTypes: {
        table: "insuranceTypes",
        columns: [
            "id",
            "code",
            "name",
            "description",

            "fixedMonthlyCost",
            "fixedUpfrontCost",

            "percentageFrom",
            "percentageMonthlyCost",
            "percentageUpfrontCost",

            "isActive"
        ]
    },

    creditInsuranceTypes: {
        table: "creditInsuranceTypes",
        columns: [
            "id",
            "creditTypeId",
            "insuranceTypeId",
            "isRequired"
        ]
    },
    
    verificationStates: {
        table: "verificationStates",
        columns: ["id", "code", "name", "description"]
    },

    paymentMethodTypes: {
        table: "paymentMethodTypes",
        columns: ["id", "code", "name", "description"]
    },

    brandTypes: {
        table: "brandTypes",
        columns: ["id", "code", "name", "description"]
    },
    bankTypes: {
        table: "bankTypes",
        columns: ["id", "code", "name", "description"]
    },

    disbursementMethodTypes: {
        table: "disbursementMethodTypes",
        columns: ["id", "code", "name", "description"]
    },
};

const cache = {
    data: {},
    byId: {},
    byCode: {},
    timestamps: {},
    loading: {}
};

const normalize = (row) =>
    Object.fromEntries(
        Object.entries(row).map(([k, v]) => [
            k.toLowerCase(),
            v
        ])
    );

const assertTable = (table) => {
    if (!TABLES[table]) {
        throw new Error(`Tabla no permitida: ${table}`);
    }
};

const isExpired = (table) => {
    const last = cache.timestamps[table];
    return !last || Date.now() - last > TTL;
};

const buildQuery = (config) => {
    return `
        SELECT ${config.columns.join(", ")}
        FROM ${config.table}
    `;
};

const loadTable = async (tableKey) => {
    const config = TABLES[tableKey];

    const result = await db.query(
        buildQuery(config)
    );

    const rows = result.rows.map(normalize);

    const byId = {};
    const byCode = {};

    for (const row of rows) {
        byId[row.id] = row;

        if (row.code) {
            byCode[row.code] = row;
        }
    }

    cache.data[tableKey] = rows;
    cache.byId[tableKey] = byId;
    cache.byCode[tableKey] = byCode;
    cache.timestamps[tableKey] = Date.now();

    return rows;
};

const ensureLoaded = async (table) => {
    if (cache.loading[table]) {
        return cache.loading[table];
    }

    if (!cache.data[table] || isExpired(table)) {
        cache.loading[table] = loadTable(table).finally(() => {
            delete cache.loading[table];
        });

        if (!cache.data[table]) {
            return cache.loading[table];
        }
    }
};

export const getAll = async (table) => {
    assertTable(table);
    await ensureLoaded(table);
    return cache.data[table] ?? [];
};

export const getById = async (table, id) => {
    assertTable(table);
    await ensureLoaded(table);
    return cache.byId[table]?.[id] ?? null;
};

export const getByCode = async (table, code) => {
    assertTable(table);
    await ensureLoaded(table);
    return cache.byCode[table]?.[code] ?? null;
};

export const getOptions = async (table, { value = "id", label = "name" } = {}) => {
    assertTable(table);
    await ensureLoaded(table);
    return (cache.data[table] ?? []).map(row => ({
        value: String(row[value]),
        label: String(row[label]),
    }));
}

export const refreshTable = async (table) => {
    assertTable(table);
    cache.timestamps[table] = 0;
    return loadTable(table);
};

export const clearTable = (table) => {
    assertTable(table);

    delete cache.data[table];
    delete cache.byId[table];
    delete cache.byCode[table];
    delete cache.timestamps[table];
    delete cache.loading[table];
};

export const warmupCache = async () => {
    await Promise.all(
        Object.keys(TABLES).map(loadTable)
    );
    console.log("[cache] ok")
};

export default {
    getAll,
    getById,
    getByCode,
    getOptions,
    refreshTable,
    clearTable,
    warmupCache
};