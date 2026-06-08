import jwt from "jsonwebtoken";
import { db, SECRET } from "../utils/db.js";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: "No hay sesión activa.", code: "NO_SESSION"});
        }

        const decoded = jwt.verify(token, SECRET);

        const { rows } = await db.query(`
            SELECT id, deletedAt
            FROM users
            WHERE id = $1
        `, [decoded.sub]);

        if (!rows.length || rows[0].deletedat) {
            return res.status(401).json({ error: "Usuario inválido.", code: "INVALID_USER" });
        }

        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ error: "Token inválido o expirado.", code: "EXPIRED_SESSION" });
    }
};

export const softVerifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        // console.log(token);

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, SECRET);

        const { rows } = await db.query(`
            SELECT id, deletedAt
            FROM users
            WHERE id = $1
        `, [decoded.sub]);

        if (!rows.length || rows[0].deletedat) {
            return res.status(401).json({ error: "Usuario inválido.", code: "INVALID_USER" });
        }

        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ error: "Token inválido o expirado.", code: "EXPIRED_SESSION" });
    }
};