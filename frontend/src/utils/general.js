import { backendUrl } from "utils/backend";

export const isPathActive = (location, path) => {
    return location.pathname === path;
}

export const DEFAULT_SUBMIT_MESSAGES = {
    GET: {
        success: "Datos obtenidos con éxito.",
        error: "Error al obtener los datos.",
    },

    POST: {
        success: "Creado con éxito.",
        error: "Error al crear.",
    },

    PATCH: {
        success: "Cambios guardados con éxito.",
        error: "Error al actualizar.",
    },

    DELETE: {
        success: "Eliminado con éxito.",
        error: "Error al eliminar.",
    },
};

export const createFetch = ({
    baseUrl = `${backendUrl}/api`,
    getToken,
    credentials: defaultCredentials,
} = {}) => {
    const request = async ({
        path = "",
        url,

        method = "POST",

        body,
        headers = {},

        token,
        credentials,

        useBaseUrl = true,

        responseType = "json",
    } = {}) => {
        const finalUrl = url || (useBaseUrl ? `${baseUrl}${path}` : path);
        const finalHeaders = { ...headers };
        const authToken = token || getToken?.();

        if (authToken) finalHeaders.Authorization = `Bearer ${authToken}`;

        const isFormData = body instanceof FormData;
        const finalBody = body && !isFormData ? JSON.stringify(body) : body;

        if (body && !isFormData) finalHeaders["Content-Type"] = "application/json";

        const response = await fetch(
            finalUrl,
            {
                method,
                headers: finalHeaders,
                credentials: credentials ?? defaultCredentials,

                ...(method !== "GET"
                    ? { body: finalBody }
                    : {}),
            }
        );

        const data =
            responseType === "text"
                ? await response.text()

                : responseType === "blob"
                    ? await response.blob()

                    : responseType === "raw"
                        ? response

                        : await response
                            .json()
                            .catch(() => null);

        if (!response.ok) {
            const err = new Error(data?.error || DEFAULT_SUBMIT_MESSAGES[method].error);
            Object.assign(err, {status: response.status, ...data });
            throw err;
        }

        return data;
    };

    return {
        request,

        get: (props) =>
            request({
                method: "GET",
                ...props,
            }),

        post: (props) =>
            request({
                method: "POST",
                ...props,
            }),

        patch: (props) =>
            request({
                method: "PATCH",
                ...props,
            }),

        delete: (props) =>
            request({
                method: "DELETE",
                ...props,
            }),
    };
};

export const onSubmit = ({
    path = "",
    url,

    method = "POST",

    body,

    headers,
    token,
    credentials,

    useBaseUrl,

    responseType,

    successMessage = DEFAULT_SUBMIT_MESSAGES[method]?.success,
    errorMessage = DEFAULT_SUBMIT_MESSAGES[method]?.error,

    confirmModal,

    multipart = false,
} = {}) => async ({
    getFormData,
    setStatus,
    setFields,
} = {}) => {
    try {
        if (confirmModal) {
            const res = await confirmModal.open();
            if (!res.ok) {
                return {
                    ok: false,
                    cancelled: true,
                };
            }

            setFields?.(
                res.data ?? {}
            );
        }

        const formData = getFormData?.();
        const fetch = createFetch();

        const resolvedBody =
            typeof body === "function"
                ? body(formData)
                : body ?? formData;

        const finalBody = (() => {
            if (!multipart || resolvedBody instanceof FormData) return resolvedBody;
            const fd = new FormData();
            for (const [key, value] of Object.entries(resolvedBody ?? {})) {
                if (value !== null && value !== undefined) fd.append(key, value);
            }
            return fd;
        })();

        const data = await fetch.request({
            path,
            url,

            method,

            body: finalBody,

            headers,
            token,
            credentials,

            useBaseUrl,

            responseType,
        });

        setStatus?.({
            type: "success",
            message: successMessage,
        });

        return {
            ok: true,
            data,
        };
    } catch (err) {
        setStatus?.(
            {
                type: "error",
                message: err.message ?? errorMessage,
                status: err.status,
            }
        );

        return {
            ok: false,
            error: err,
        };
    }
};