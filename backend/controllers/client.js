import { db } from "../utils/db.js";

// CLIENT

export const getClient = async (req, res) => {
    try {
        const userId = req.user.sub;

        const { rows } = await db.query(`
            SELECT 
                c.id,
                c.nationalId,
                c.birthDate,
                c.maritalStatusId
            FROM clients c
            WHERE c.userId = $1
            AND c.deletedAt IS NULL
        `, [userId]);

        if (!rows.length) {
            return res.status(404).json({
                error: "Cliente no encontrado"
            });
        }

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const updateClient = async (req, res) => {
    try {
        const userId = req.user.sub;
        const {
            nationalId,
            maritalStatusId,
            birthDate
        } = req.body;

        const { rows } = await db.query(`
            UPDATE clients c
            SET
                maritalStatusId = COALESCE($1, c.maritalStatusId),
                birthDate = COALESCE($2, c.birthDate),
                updatedAt = NOW()
            WHERE c.userId = $3
            AND c.deletedAt IS NULL
            RETURNING c.*
        `, [maritalStatusId, birthDate, userId]);

        if (!rows.length) {
            return res.status(404).json({
                error: "Cliente no encontrado"
            });
        }

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const deleteClient = async (req, res) => {
    const client = await db.connect();

    try {
        const userId = req.user.sub;

        await client.query("BEGIN");

        const { rowCount: clientCount } = await client.query(`
            UPDATE clients
            SET deletedAt = NOW()
            WHERE userId = $1
            AND deletedAt IS NULL
        `, [userId]);

        if (clientCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                error: "Cliente no encontrado"
            });
        }

        await client.query(`
            UPDATE users
            SET deletedAt = NOW()
            WHERE id = $1
            AND deletedAt IS NULL
        `, [userId]);

        await client.query("COMMIT");

        return res.json({ message: "Cliente eliminado" });

    } catch (err) {
        await client.query("ROLLBACK");
        return res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

// INCOME

export const getClientIncome = async (req, res) => {
    try {
        const userId = req.user.sub;

        const { rows } = await db.query(`
            SELECT ci.*
            FROM clientIncome ci
            JOIN clients c ON c.id = ci.clientId
            WHERE c.userId = $1
            AND ci.deletedAt IS NULL
        `, [userId]);

        return res.json(rows);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const createClientIncome = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { monthlyIncome, sourceId } = req.body;

        if (!monthlyIncome || monthlyIncome <= 0) {
            return res.status(400).json({
                error: "Ingreso inválido"
            });
        }

        const { rows: clientRows } = await db.query(`
            SELECT id FROM clients WHERE userId = $1
        `, [userId]);

        if (!clientRows.length) {
            return res.status(404).json({
                error: "Cliente no encontrado"
            });
        }

        const clientId = clientRows[0].id;

        const { rows } = await db.query(`
            INSERT INTO clientIncome (clientId, monthlyIncome, sourceId)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [clientId, monthlyIncome, sourceId]);

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const updateClientIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.sub;
        const { monthlyIncome, sourceId } = req.body;

        if (monthlyIncome !== undefined && monthlyIncome <= 0) {
            return res.status(400).json({
                error: "Ingreso inválido"
            });
        }

        const { rows } = await db.query(`
            UPDATE clientIncome ci
            SET 
                monthlyIncome = COALESCE($1, ci.monthlyIncome),
                sourceId = COALESCE($2, ci.sourceId),
                updatedAt = NOW()
            FROM clients c
            WHERE ci.id = $3
            AND ci.clientId = c.id
            AND c.userId = $4
            AND ci.deletedAt IS NULL
            RETURNING ci.*
        `, [monthlyIncome, sourceId, id, userId]);

        if (!rows.length) {
            return res.status(404).json({
                error: "Ingreso no encontrado o no pertenece al usuario"
            });
        }

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const deleteClientIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.sub;

        const { rowCount } = await db.query(`
            UPDATE clientIncome ci
            SET deletedAt = NOW()
            FROM clients c
            WHERE ci.id = $1
            AND ci.clientId = c.id
            AND c.userId = $2
        `, [id, userId]);

        if (rowCount === 0) {
            return res.status(404).json({
                error: "Ingreso no encontrado o no pertenece al usuario"
            });
        }

        return res.json({ message: "Ingreso eliminado" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// EMPLOYMENT

export const getClientEmployment = async (req, res) => {
    try {
        const userId = req.user.sub;

        const { rows } = await db.query(`
            SELECT ce.*
            FROM clientEmployment ce
            JOIN clients c ON c.id = ce.clientId
            WHERE c.userId = $1
            AND ce.deletedAt IS NULL
        `, [userId]);

        return res.json(rows);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const createClientEmployment = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { jobTypeId, salary, startDate, sourceId } = req.body;

        if (!salary || salary <= 0) {
            return res.status(400).json({
                error: "Salario inválido"
            });
        }

        const { rows: clientRows } = await db.query(`
            SELECT id FROM clients WHERE userId = $1
        `, [userId]);

        if (!clientRows.length) {
            return res.status(404).json({
                error: "Cliente no encontrado"
            });
        }

        const clientId = clientRows[0].id;

        const { rows } = await db.query(`
            INSERT INTO clientEmployment (clientId, jobTypeId, salary, startDate, sourceId)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [clientId, jobTypeId, salary, startDate, sourceId]);

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const updateClientEmployment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.sub;
        const { jobTypeId, salary, startDate, sourceId } = req.body;

        if (salary !== undefined && salary <= 0) {
            return res.status(400).json({
                error: "Salario inválido"
            });
        }

        const { rows } = await db.query(`
            UPDATE clientEmployment ce
            SET 
                jobTypeId = COALESCE($1, ce.jobTypeId),
                salary = COALESCE($2, ce.salary),
                startDate = COALESCE($3, ce.startDate),
                sourceId = COALESCE($4, ce.sourceId),
                updatedAt = NOW()
            FROM clients c
            WHERE ce.id = $5
            AND ce.clientId = c.id
            AND c.userId = $6
            AND ce.deletedAt IS NULL
            RETURNING ce.*
        `, [jobTypeId, salary, startDate, sourceId, id, userId]);

        if (!rows.length) {
            return res.status(404).json({
                error: "Empleo no encontrado o no pertenece al usuario"
            });
        }

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const deleteClientEmployment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.sub;

        const { rowCount } = await db.query(`
            UPDATE clientEmployment ce
            SET deletedAt = NOW()
            FROM clients c
            WHERE ce.id = $1
            AND ce.clientId = c.id
            AND c.userId = $2
        `, [id, userId]);

        if (rowCount === 0) {
            return res.status(404).json({
                error: "Empleo no encontrado o no pertenece al usuario"
            });
        }

        return res.json({ message: "Empleo eliminado" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// ASSETS

export const getClientAssets = async (req, res) => {
    try {
        const userId = req.user.sub;

        const { rows } = await db.query(`
            SELECT ca.*
            FROM clientAssets ca
            JOIN clients c ON c.id = ca.clientId
            WHERE c.userId = $1
            AND ca.deletedAt IS NULL
        `, [userId]);

        return res.json(rows);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const createClientAsset = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { type, value, sourceId } = req.body;

        if (!value || value <= 0) {
            return res.status(400).json({
                error: "Valor inválido"
            });
        }

        const { rows: clientRows } = await db.query(`
            SELECT id FROM clients WHERE userId = $1
        `, [userId]);

        if (!clientRows.length) {
            return res.status(404).json({
                error: "Cliente no encontrado"
            });
        }

        const clientId = clientRows[0].id;

        const { rows } = await db.query(`
            INSERT INTO clientAssets (clientId, type, value, sourceId)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [clientId, type, value, sourceId]);

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const updateClientAsset = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.sub;
        const { type, value, sourceId } = req.body;

        if (value !== undefined && value <= 0) {
            return res.status(400).json({
                error: "Valor inválido"
            });
        }

        const { rows } = await db.query(`
            UPDATE clientAssets ca
            SET 
                type = COALESCE($1, ca.type),
                value = COALESCE($2, ca.value),
                sourceId = COALESCE($3, ca.sourceId),
                updatedAt = NOW()
            FROM clients c
            WHERE ca.id = $4
            AND ca.clientId = c.id
            AND c.userId = $5
            AND ca.deletedAt IS NULL
            RETURNING ca.*
        `, [type, value, sourceId, id, userId]);

        if (!rows.length) {
            return res.status(404).json({
                error: "Activo no encontrado o no pertenece al usuario"
            });
        }

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const deleteClientAsset = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.sub;

        const { rowCount } = await db.query(`
            UPDATE clientAssets ca
            SET deletedAt = NOW()
            FROM clients c
            WHERE ca.id = $1
            AND ca.clientId = c.id
            AND c.userId = $2
        `, [id, userId]);

        if (rowCount === 0) {
            return res.status(404).json({
                error: "Activo no encontrado o no pertenece al usuario"
            });
        }

        return res.json({ message: "Activo eliminado" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// LIABILITIES

export const getClientLiabilities = async (req, res) => {
    try {
        const userId = req.user.sub;

        const { rows } = await db.query(`
            SELECT cl.*
            FROM clientLiabilities cl
            JOIN clients c ON c.id = cl.clientId
            WHERE c.userId = $1
            AND cl.deletedAt IS NULL
        `, [userId]);

        return res.json(rows);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const createClientLiability = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { type, amount, monthlyPayment } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                error: "Monto inválido"
            });
        }

        const { rows: clientRows } = await db.query(`
            SELECT id FROM clients WHERE userId = $1
        `, [userId]);

        if (!clientRows.length) {
            return res.status(404).json({
                error: "Cliente no encontrado"
            });
        }

        const clientId = clientRows[0].id;

        const { rows } = await db.query(`
            INSERT INTO clientLiabilities (clientId, type, amount, monthlyPayment)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [clientId, type, amount, monthlyPayment]);

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const updateClientLiability = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.sub;
        const { type, amount, monthlyPayment } = req.body;

        if (amount !== undefined && amount <= 0) {
            return res.status(400).json({
                error: "Monto inválido"
            });
        }

        if (monthlyPayment !== undefined && monthlyPayment <= 0) {
            return res.status(400).json({
                error: "Pago mensual inválido"
            });
        }

        const { rows } = await db.query(`
            UPDATE clientLiabilities cl
            SET 
                type = COALESCE($1, cl.type),
                amount = COALESCE($2, cl.amount),
                monthlyPayment = COALESCE($3, cl.monthlyPayment),
                updatedAt = NOW()
            FROM clients c
            WHERE cl.id = $4
            AND cl.clientId = c.id
            AND c.userId = $5
            AND cl.deletedAt IS NULL
            RETURNING cl.*
        `, [type, amount, monthlyPayment, id, userId]);

        if (!rows.length) {
            return res.status(404).json({
                error: "Deuda no encontrada o no pertenece al usuario"
            });
        }

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const deleteClientLiability = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.sub;

        const { rowCount } = await db.query(`
            UPDATE clientLiabilities cl
            SET deletedAt = NOW()
            FROM clients c
            WHERE cl.id = $1
            AND cl.clientId = c.id
            AND c.userId = $2
        `, [id, userId]);

        if (rowCount === 0) {
            return res.status(404).json({
                error: "Deuda no encontrada o no pertenece al usuario"
            });
        }

        return res.json({ message: "Deuda eliminada" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};