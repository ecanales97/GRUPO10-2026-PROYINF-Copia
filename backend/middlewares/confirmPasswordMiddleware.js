import bcrypt from "bcrypt";
import { db } from "../utils/db.js";

export const confirmPassword = async (req, res, next) => {
    try {
        const userId = req.user.sub;
        const { currentPassword } = req.body;

        if (!currentPassword) {
            return res.status(400).json({
                error: "Debe confirmar la contraseña actual."
            });
        }

        const { rows } = await db.query(`
            SELECT passwordHash
            FROM users
            WHERE id = $1
            AND deletedAt IS NULL
        `, [userId]);

        if (!rows.length) {
            return res.status(404).json({
                error: "Usuario no encontrado."
            });
        }

        const isValid =
            await bcrypt.compare(
                currentPassword,
                rows[0].passwordhash
            );

        if (!isValid) {
            return res.status(401).json({
                error: "Contraseña incorrecta."
            });
        }

        next();

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};