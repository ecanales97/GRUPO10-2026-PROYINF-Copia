import { useEffect, useState } from "react";

import { backendUrl } from "utils/backend";

let cache = null;
let loadingPromise = null;

const normalize = (items) => {
    if (!Array.isArray(items)) {
        return items;
    }

    return items.map((item) => ({
        value: item.id.toString(),
        label: item.name,
        raw: item
    }));
};

const normalizeCatalogs = (catalogs) => {
    const normalized = {};

    for (const [key, value] of Object.entries(catalogs)) {
        if (
            key === "creditItems" &&
            value &&
            typeof value === "object"
        ) {
            normalized[key] = {};

            for (const [creditType, items] of Object.entries(value)) {
                normalized[key][creditType] =
                    normalize(items);
            }

            continue;
        }

        normalized[key] = normalize(value);
    }

    return normalized;
};

const fetchCatalogs = async () => {
    if (cache) {
        return cache;
    }

    if (loadingPromise) {
        return loadingPromise;
    }

    loadingPromise = fetch(
        `${backendUrl}/api/catalogs`
    )
        .then(async (res) => {
            if (!res.ok) {
                throw new Error(
                    "Error cargando catálogos"
                );
            }

            const json = await res.json();

            return normalizeCatalogs(
                json.data
            );
        })
        .then((data) => {
            cache = data;
            return data;
        })
        .finally(() => {
            loadingPromise = null;
        });

    return loadingPromise;
};

export const clearCatalogsCache = () => {
    cache = null;
    loadingPromise = null;
};

export const getCatalogsCache = () => {
    return cache;
};

export const useCatalogs = () => {
    const [catalogs, setCatalogs] =
        useState(cache);

    const [loading, setLoading] =
        useState(!cache);

    const [error, setError] =
        useState(null);

    useEffect(() => {
        if (cache) {
            return;
        }

        let mounted = true;

        fetchCatalogs()
            .then((data) => {
                if (!mounted) {
                    return;
                }

                setCatalogs(data);
                setLoading(false);
            })
            .catch((err) => {
                if (!mounted) {
                    return;
                }

                setError(err);
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    return {
        catalogs,
        loading,
        error
    };
};