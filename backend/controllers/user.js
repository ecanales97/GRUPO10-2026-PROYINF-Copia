import { db } from "../utils/db.js";

export const getUser = async (req, res) => {
    try {
        const userId = req.user.sub;

        const { rows } = await db.query(`
            SELECT id, name, nickname, email, phone, roleId
            FROM users
            WHERE id = $1 AND deletedAt IS NULL
        `, [userId]);

        if (!rows.length) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { name, nickname, phone } = req.body;

        const { rows } = await db.query(`
            UPDATE users
            SET 
                name = COALESCE($1, name),
                nickname = COALESCE($2, nickname),
                phone = COALESCE($3, phone),
                updatedAt = NOW()
            WHERE id = $4 AND deletedAt IS NULL
            RETURNING id, name, nickname, email, phone
        `, [name, nickname, phone, userId]);

        return res.json(rows[0]);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.user.sub;

        await db.query(`
            UPDATE users
            SET deletedAt = NOW()
            WHERE id = $1
        `, [userId]);

        return res.json({ message: "Usuario eliminado" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};