import { db } from "./db.js";
import { getClientByNationalId, getUserByEmail } from "./getData.js";

// para simulador
export const validateNationalId = async (nationalId) => {
    return true;
}

// para auth
export const isEmpty = (v) => !v || v.trim().length === 0;

export const passwordsMatch = (p1, p2) => p1 === p2;

export const validateUniqueEmail = async (email) => {
    const user = await getUserByEmail(email);
    if (user) {
        throw new Error("El correo ya está registrado");
    }
};

export const validateUniqueClient = async (nationalId) => {
    const client = await getClientByNationalId(nationalId);
    if (client) {
        throw new Error("El cliente ya está registrado");
    }
};