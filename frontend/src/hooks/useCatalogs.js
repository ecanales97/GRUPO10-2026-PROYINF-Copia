import { useEffect, useState } from "react";
import { preloadCatalogs } from "config/options";

export const useCatalogs = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        preloadCatalogs()
            .then(() => {
                if (mounted) setLoading(false);
            })
            .catch((err) => {
                if (mounted) setError(err);
            });

        return () => {
            mounted = false;
        };
    }, []);

    return { loading, error };
};