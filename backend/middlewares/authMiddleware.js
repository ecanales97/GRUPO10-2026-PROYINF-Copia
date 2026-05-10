import jwt from "jsonwebtoken";

import { db, SECRET } from "../utils/db.js";

export const verifyToken = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header) {
            return res.status(401).json({ error: "No se proporcionó token de autenticación" });
        }

        const token = header.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Formato de token inválido" });
        }

        const decoded = jwt.verify(token, SECRET);

        const { rows } = await db.query(`
            SELECT id, deletedAt
            FROM users
            WHERE id = $1
        `, [decoded.sub]);

        if (!rows.length || rows[0].deletedat) {
            return res.status(401).json({
                error: "Usuario inválido"
            });
        }

        req.user = decoded; 
        next(); 
    } catch (e) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
};