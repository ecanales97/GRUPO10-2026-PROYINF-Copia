import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { backendUrl } from "utils/backend";
import { handleData, handleDelay } from "utils/handlers";

const cleanFormData = (formData) => {
    if (!formData) return null;

    const {
        selected,
        ...cleaned
    } = formData;

    return cleaned;
};

const requestsAreEqual = (a, b) =>
    JSON.stringify(a) === JSON.stringify(b);

const handleSaveSimulation = async (data) => {
    if (!data) {
        return {
            ok: false,
            error: "No hay datos",
        };
    }

    try {
        const res = await fetch(
            backendUrl + "/api/simulacion/guardar",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(data),
            }
        );

        const json = await res.json();

        if (!res.ok) {
            return {
                ok: false,
                error: json.error,
            };
        }

        return { ok: true };
    } catch {
        return {
            ok: false,
            error: "Error de conexión",
        };
    }
};

export const useSimulation = ({
    formData,
    creditType,
    token,
}) => {
    const parsedFormData = useMemo(() => {
        return cleanFormData(
            handleData(formData)
        );
    }, [formData]);

    const [data, setData] = useState(null);
    const [loading, setLoading] =
        useState(true);
    const [error, setError] = useState(null);
    const [fields, setFields] =
        useState(null);

    const previousRequestRef =
        useRef(null);

    const saveSimulation = useCallback(async (option) => {
        return handleSaveSimulation(option);
    }, []);

    useEffect(() => {
        if (!parsedFormData) return;

        const currentRequest = parsedFormData;

        if (
            previousRequestRef.current &&
            requestsAreEqual(
                previousRequestRef.current,
                currentRequest
            )
        ) {
            return;
        }

        previousRequestRef.current = currentRequest;

        const fetchSimulation = async () => {
            try {
                setLoading(true);
                setError(null);
                setFields(null);

                const res = await fetch(
                    `${backendUrl}/api/credits/${creditType}/simulation`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify(currentRequest),
                    }
                );

                const json = await res.json();

                if (!res.ok) {
                    setFields(json.fields);

                    throw new Error(
                        json.error ||
                            "Error al simular crédito."
                    );
                }

                await handleDelay(1500);

                setData(json);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSimulation();
    }, [
        parsedFormData,
        creditType,
        token,
    ]);

    return {
        data,
        loading,
        error,
        fields,
        saveSimulation,
    };
};