import Cache from "../utils/cache.js";

const TABLE_ALIAS = {
    "job-types": "jobTypes",
    "asset-types": "assetTypes",
    "client-marital-status": "clientMaritalStatus"
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

        return res.json({
            data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Error interno del servidor"
        });
    }
}