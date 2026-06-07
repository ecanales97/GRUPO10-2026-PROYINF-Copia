import { useState, useCallback, useRef, useEffect } from "react";
import { createFetch, onSubmit as utilOnSubmit } from "utils/general";

export const useFetch = ({
    path = "",
    url,
    method = "GET",
    body,
    headers,
    token,
    credentials,
    useBaseUrl,
    responseType,
    immediate = false,
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    confirmModal,
} = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState(null);

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const run = useCallback(async (overrides = {}) => {
        setLoading(true);
        setError(null);

        const fetch = createFetch();

        try {
            console.log("fetch");
            const result = await fetch.request({
                path,
                url,
                method,
                body: typeof body === "function" ? body(overrides) : overrides.body ?? body,
                headers: { ...headers, ...overrides.headers },
                token,
                credentials,
                useBaseUrl,
                responseType,
                ...overrides,
            });

            if (!mountedRef.current) return;

            setData(result);
            onSuccess?.(result);
            return { ok: true, data: result };
        } catch (err) {
            if (!mountedRef.current) return;

            setError(err.message ?? "Error inesperado");
            onError?.(err);
            return { ok: false, error: err };
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, [path, url, method, body, headers, token, credentials, useBaseUrl, responseType, onSuccess, onError]);

    const onSubmit = useCallback(async ({ getFormData, setFields } = {}) => {
        if (!mountedRef.current) return;
        setLoading(true);
        setError(null);
        setStatus(null);

        try {
            const result = await utilOnSubmit({
                path,
                url,
                method,
                body,
                headers,
                token,
                credentials,
                useBaseUrl,
                responseType,
                successMessage,
                errorMessage,
                confirmModal,
            })({
                getFormData,
                setFields,
                setStatus: (s) => {
                    if (!mountedRef.current) return;
                    setStatus(s);
                    if (s.type === "error") setError(s.message);
                },
            });

            if (!mountedRef.current) return result;

            if (result?.ok) {
                setData(result.data);
                onSuccess?.(result.data);
            } else if (!result?.cancelled) {
                onError?.(result?.error);
            }

            return result;
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, [path, url, method, body, headers, token, credentials, useBaseUrl, responseType, successMessage, errorMessage, confirmModal, onSuccess, onError]);

    useEffect(() => {
        if (immediate) run();
    }, [immediate, run]);

    return { data, loading, error, status, run, onSubmit };
};