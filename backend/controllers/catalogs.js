import Cache from "../utils/cache.js";

const TABLE_ALIAS = {
    "job-types": "jobTypes",
    "contract-types": "contractTypes",
    "income-types": "incomeTypes",

    "asset-types": "assetTypes",
    "liability-types": "liabilityTypes",

    "credit-types": "creditTypes",

    "client-marital-status": "clientMaritalStatus",
};

export const catalogs = async (req, res) => {
    try {
        const { table } = req.params;

        const key = TABLE_ALIAS[table];

        if (!key) {
            return res.status(400).json({
                error: "Catálogo no válido"
            });
        }

        const data = await Cache.getAll(key);

        return res.json({ data });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Error interno del servidor"
        });
    }
};

export const catalogsAll = async (req, res) => {
    try {
        const entries = await Promise.all(
            Object.values(TABLE_ALIAS).map(async (table) => {
                const data = await Cache.getAll(table);
                return [table, data];
            })
        );

        return res.json({
            data: Object.fromEntries(entries)
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Error interno del servidor"
        });
    }
};

export const catalogsType = (req, res) => {
    return res.json({
        data: TABLE_ALIAS
    });
};