import { useRef, useState } from "react";
import { backendUrl } from "utils/backend";

/**
 * UPDATE: ahora usa useRef en vez de useState, para evitar
 * doble renderizado innecesario en los formularios
 * UPDATE2: ahora usa sessionStorage, para que al recargar
 * se mantenga el formData
 * UPDATE3: adaptacion para utilizar el backend, por defecto
 * seguira usandose el frontend
 * UPDATE4: archivos/blobs se guardan en ref separado para
 * evitar iterar todo el formData en cada persist()
 * UPDATE5: ACTUALIZADO FINALMENTE PARA USAR BACKEND DE
 * VERDAD :D
 *
 * hook para manejar la data de un formulario.
 *
 * - `defaultData` - la data que debe tener el form por defecto.
 * - `useStorage` - se usa o no (booleano) el storage de la sesion.
 * - `storageKey` - key donde se guardara el formData en la sesion.
 */
export const useFormData = (
    defaultData = {},
    useStorage  = true,
    storageKey  = "",
    useBackend  = false,
    backendConfig = {},
) => {
    const formData = useRef();
    const fileFields = useRef({});
    const wzdId = useRef(null);
    const [refresh, setRefresh] = useState(0);

    if (useBackend) {
        const { wizardType } = backendConfig;
 
        const apiUrl = (p) => `${backendUrl}/api/wizard/${wizardType}${p}`;
 
        const apiCall = async (method, path, body) => {
            const res = await fetch(apiUrl(path), {
                method,
                credentials: "include",
                headers: body ? { "Content-Type": "application/json" } : {},
                body: body ? JSON.stringify(body) : undefined,
            });
            const data = await res.json();
            if (res.status === 410) {
                const err = new Error(data.error ?? "Transacción expirada o inválida.");
                err.expired = true;
                throw err;
            }
            if (!res.ok) throw data;
            return data;
        };

        const patchFields = async (fields) => {
            const wzd = wzdId.current;
            if (!wzd) return;

            // console.log(fields);
 
            const fd = new FormData();
            const jsonBody = {};
 
            for (const [key, value] of Object.entries(fields)) {
                if (value instanceof File || value instanceof Blob) {
                    fd.append(key, value);
                } else if (Array.isArray(value)) {
                    const pending = value.filter(
                        (v) => v instanceof File || v?.file instanceof File,
                    );
                    const uploaded = value.filter((v) => v?.uploaded === true);
 
                    for (const entry of pending) {
                        const file = entry instanceof File ? entry : entry.file;
                        fd.append(`${key}[]`, file);
                    }

                    if (uploaded.length) {
                        jsonBody[key] = uploaded;
                    }
                } else if (value?.uploaded === true) {
                    // se ignora
                } else {
                    jsonBody[key] = value ?? null;
                }
            }

            fd.append("__json", JSON.stringify(jsonBody));

            // for (const [key, value] of fd.entries()) console.log(key,value);
 
            const res = await fetch(apiUrl(`/fields?wzd=${wzd}`), {
                method:      "PATCH",
                credentials: "include",
                body:        fd,
            });
 
            const data = await res.json();
 
            if (res.status === 410) {
                const err = new Error(data.error ?? "Transacción expirada o inválida.");
                err.expired = true;
                throw err;
            }
            if (!res.ok) throw data;

            if (data.formData) {
                formData.current = { ...defaultData, ...data.formData };
            }
 
            return data;
        };

        if (!formData.current) formData.current = { ...defaultData };
 
        const getFormData = () => ({ ...formData.current });
        const getField    = (key) => formData.current[key];
 
        const setField = async (key, value) => {
            formData.current = { ...formData.current, [key]: value };
            await patchFields({ [key]: value });
        };
 
        const setFields = async (values = {}) => {
            formData.current = { ...formData.current, ...values };
            await patchFields(values);
        };
 
        const resetField = async (key) => {
            const def = defaultData[key];
            formData.current = { ...formData.current, [key]: def };
            await patchFields({ [key]: def ?? null });
        };
 
        const resetForm = async () => {
            formData.current = { ...defaultData };
            await patchFields(
                Object.fromEntries(
                    Object.keys(defaultData).map((k) => [k, defaultData[k] ?? null]),
                ),
            );
        };
 
        const startSession = async () => {
            const data = await apiCall("POST", "/start");
            wzdId.current = data.wzd;
            formData.current = { ...defaultData };
            return data.wzd;
        };
 
        const resumeSession = async (wzd) => {
            const data = await apiCall("GET", `/resume${`?wzd=${wzd}`}`);
            wzdId.current = wzd;
            
            const saved = await apiCall("GET", `/data?wzd=${wzd}`);
            formData.current = { ...defaultData, ...saved.formData };

            setRefresh(r => r+1);

            return data;
        };
 
        const endSession = async () => {
            const wzd = wzdId.current;
            if (!wzd) return;
            await apiCall("DELETE", `/session?wzd=${wzd}`);
            wzdId.current  = null;
            formData.current = { ...defaultData };
        };
 
        const syncFromBackend = async () => {
            const wzd = wzdId.current;
            if (!wzd) return;
            const data = await apiCall("GET", `/data?wzd=${wzd}`);
            formData.current = { ...defaultData, ...data.formData };
            setRefresh(r => r+1);
        };
 
        return {
            getFormData,
            getField,
            setField,
            setFields,
            resetField,
            resetForm,

            getSessionId: () => wzdId.current,
            setSessionId: (id) => { wzdId.current = id; },
            startSession,
            resumeSession,
            endSession,
            syncFromBackend,
            clearStorage: () => {},
            hasSavedData: () => !!wzdId.current,
            refresh,
        };
    }
 
    const canUseStorage = typeof window !== "undefined" && useStorage && storageKey;
 
    const getInitialData = () => {
        if (!canUseStorage) return { ...defaultData };
        try {
            const saved = sessionStorage.getItem(storageKey);
            if (!saved) return { ...defaultData };
            return { ...defaultData, ...JSON.parse(saved) };
        } catch {
            return { ...defaultData };
        }
    };
 
    if (!formData.current) formData.current = getInitialData();
 
    const persist = () => {
        if (!canUseStorage) return;
        try {
            const serializable = Object.fromEntries(
                Object.entries(formData.current).filter(([k]) => !(k in fileFields.current)),
            );
            sessionStorage.setItem(storageKey, JSON.stringify(serializable));
        } catch {}
    };
 
    const getFormData = () => ({ ...formData.current });
    const getField    = (key) => formData.current[key];
 
    const setField = (key, value) => {
        if (value instanceof File || value instanceof Blob) fileFields.current[key] = true;
        else delete fileFields.current[key];
        formData.current = { ...formData.current, [key]: value };
        persist();
    };
 
    const setFields = (values = {}) => {
        for (const [k, v] of Object.entries(values)) {
            if (v instanceof File || v instanceof Blob) fileFields.current[k] = true;
            else delete fileFields.current[k];
        }
        formData.current = { ...formData.current, ...values };
        persist();
    };
 
    const resetField = (key) => {
        delete fileFields.current[key];
        formData.current = { ...formData.current, [key]: defaultData[key] };
        persist();
    };
 
    const resetForm = () => {
        fileFields.current = {};
        formData.current   = { ...defaultData };
        persist();
    };
 
    const clearStorage = () => {
        if (!canUseStorage) return;
        sessionStorage.removeItem(storageKey);
    };
 
    const hasSavedData = () => {
        if (!canUseStorage) return false;
        return !!sessionStorage.getItem(storageKey);
    };
 
    return {
        getFormData,
        getField,
        setField,
        setFields,
        resetField,
        resetForm,
        clearStorage,
        hasSavedData,
        refresh,
    };
};
