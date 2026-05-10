import { db } from "./db.js";

const TTL = 1000 * 60 * 30;

const TABLES = {
    creditTypes: { table: "creditTypes", hasCode: true, hasDesc: true },
    applicationTypes: { table: "applicationTypes", hasCode: true },
    transactionTypes: { table: "transactionTypes", hasCode: true },
    documentTypes: { table: "documentTypes", hasCode: true, hasDesc: true },

    assetTypes: { table: "assetTypes", hasCode: true, hasDesc: true },
    liabilityTypes: { table: "liabilityTypes", hasCode: true, hasDesc: true },

    clientDataSources: { table: "clientDataSources", hasCode: true, hasDesc: true },
    auditLogTypes: { table: "auditLogTypes", hasCode: true },

    jobTypes: { table: "jobTypes" },

    applicationStatus: { table: "applicationStatus", hasCode: true },
    creditStatus: { table: "creditStatus", hasCode: true },
    creditInstallmentStatus: { table: "creditInstallmentStatus", hasCode: true },

    riskLevels: { table: "riskLevels", hasCode: true },
    decisions: { table: "decisions", hasCode: true },

    userRoles: { table: "userRoles", hasCode: true, hasDesc: true },

    clientMaritalStatus: { table: "clientMaritalStatus", hasCode: true, hasDesc: true }
};

const cache = {
    data: {},
    byId: {},
    byCode: {},
    timestamps: {},
    loading: {}
};

const assertTable = (table) => {
    if (!TABLES[table]) {
        throw new Error(`Tabla no permitida: ${table}`);
    }
};

const isExpired = (table) => {
    const last = cache.timestamps[table];
    return !last || Date.now() - last > TTL;
};

const loadTable = async (tableKey) => {
    const { table, hasCode, hasDesc } = TABLES[tableKey];

    const query = `SELECT id ${hasCode ? ", code" : ""} , name ${hasDesc ? ", description" : ""} FROM ${table}`;

    const { rows } = await db.query(query);

    const byId = {};
    const byCode = hasCode ? {} : null;

    for (const row of rows) {
        byId[row.id] = row;

        if (hasCode && row.code) {
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
    const cached = cache.data[table];

    if (!cached) {
        return loadTable(table);
    }

    if (isExpired(table) && !cache.loading[table]) {
        cache.loading[table] = loadTable(table)
            .finally(() => {
                delete cache.loading[table];
            });
    }
};

export const getByCode = async (table, code) => {
    assertTable(table);
    await ensureLoaded(table);

    if (!TABLES[table].hasCode) {
        throw new Error(`La tabla "${table}" no soporta búsqueda por code`);
    }

    return cache.byCode[table]?.[code] ?? null;
};

export const getById = async (table, id) => {
    assertTable(table);
    await ensureLoaded(table);

    return cache.byId[table]?.[id] ?? null;
};

export const getAll = async (table) => {
    assertTable(table);
    await ensureLoaded(table);

    return cache.data[table] ?? [];
};

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
};

const Cache = {
    getByCode,
    getById,
    getAll,
    refreshTable,
    clearTable,
    warmupCache
};

export default Cache;