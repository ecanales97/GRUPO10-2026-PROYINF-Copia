import { z } from "zod";

import { db } from "./db.js";
import { getClientByNationalId, getUserByEmail } from "./getData.js";

// para simulador
export const validateNationalId = async (nationalId) => {
    return true;
}

// para auth
export const isEmpty = (v) => !v || v.trim().length === 0;

export const passwordsMatch = (p1, p2) => p1 === p2;

export const validateUniqueEmail = async (email, userId) => {
    const user = await getUserByEmail(email);

    if (!user) return;
    if (userId && user.id === userId) return;

    throw new Error("El correo ya está registrado");
};

export const validateUniqueClient = async (nationalId) => {
    const client = await getClientByNationalId(nationalId);
    if (client) {
        throw new Error("El cliente ya está registrado");
    }
};

// para validar schemas, shape es validations, data la data (xd) y refinements el objectValidations
export const validate = (shape, data, refinements = []) => {
    const schema = refinements.reduce((s, fn) => fn(s), z.object(shape));
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new Error(result.error.errors[0].message);
    }
    return result.data;
};

// como validate pero devuelve todos los errores
export const validateShape = (shape, data, refinements = []) => {
    const schema = refinements.reduce((s, fn) => fn(s), z.object(shape));
    const result = schema.safeParse(data);
    if (result.success) return { ok: true };
    
    const errors = {};
    for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (key && !errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
};