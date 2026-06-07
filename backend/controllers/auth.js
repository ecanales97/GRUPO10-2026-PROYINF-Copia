import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db, SECRET } from "../utils/db.js";

import {
    getRoleId,
} from "../utils/getData.js";

import {
    validateUniqueEmail,
    validateUniqueClient,
    isEmpty,
    passwordsMatch
} from "../utils/validateData.js";

const registerClient = async (data) => {
    const client = await db.connect();

    try {
        let {
            name,
            nickname,
            phone,
            email,

            password,
            confirmPassword,

            nationalId,

            maritalStatusId,

            birthDate
        } = data;

        name = name?.trim();
        nickname = nickname?.trim();
        phone = phone?.trim();
        email = email?.trim();
        nationalId = nationalId?.trim();

        if (
            isEmpty(name) ||
            isEmpty(nickname) ||
            isEmpty(email) ||
            isEmpty(password) ||
            isEmpty(confirmPassword) ||
            isEmpty(nationalId)
        ) {
            throw new Error("Faltan campos obligatorios");
        }

        if (!passwordsMatch(password, confirmPassword)) {
            throw new Error("Las contraseñas no coinciden");
        }

        await validateUniqueEmail(email);

        await validateUniqueClient(nationalId);

        const passwordHash = await bcrypt.hash(password, 12);
        const roleId = await getRoleId("CLIENT");

        await client.query("BEGIN");

        const userResult = await client.query(
            `INSERT INTO users (
                name,
                nickname,
                email,
                phone,
                passwordHash,
                roleId
            ) VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            ) RETURNING id`,
            [
                name,
                nickname,
                email,
                phone,
                passwordHash,
                roleId
            ]
        );

        const userId = userResult.rows[0].id;

        await client.query(
            `INSERT INTO clients (
                userId,
                nationalId,
                birthDate,
                maritalStatusId
            ) VALUES (
                $1,
                $2,
                $3,
                $4
            )`,
            [
                userId,
                nationalId,
                birthDate,
                maritalStatusId
            ]
        );

        await client.query("COMMIT");

        return { message: "Usuario registrado con éxito" };

    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

const loginClient = async (data) => {
    const { nationalId, password } = data;

    const { rows } = await db.query(
        `SELECT u.*, c.id as clientid
        FROM users u
        LEFT JOIN clients c ON c.userId = u.id
        WHERE nationalId = $1;`,
        [nationalId]
    );

    if (!rows.length) throw new Error("Usuario no encontrado");

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.passwordhash);
    if (!valid) throw new Error("Contraseña incorrecta");

    return jwt.sign(
        { sub: user.id, role: user.roleid, clientId: user.clientid },
        SECRET,
        { expiresIn: "30m" }
    );
};

export const register = async (req, res) => {
    try {
        const result = await registerClient(req.body);
        return res.json(result);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const token = await loginClient(req.body);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 60 * 1000,
            path: "/"
        });

        return res.json({ message: "Login exitoso" });
    } catch (err) {
        return res.status(401).json({ error: err.message });
    }
};

export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
    });
    return res.json({ message: "Sesión cerrada" });
};

export const refresh = (req, res) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ error: "No hay sesión activa" });
        }

        const payload = jwt.verify(token, SECRET);

        const newToken = jwt.sign(
            {
                sub: payload.sub,
                role: payload.role,
                clientId: payload.clientId
            },
            SECRET,
            { expiresIn: "30m" }
        );

        res.cookie("token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 60 * 1000,
            path: "/"
        });

        return res.json({ message: "Token renovado" });

    } catch (err) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
};