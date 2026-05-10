import { createContext, useContext, useEffect, useState } from "react";
import { handleCreditConfig } from "utils/handlers";

const CreditsContext = createContext(null);

export const CreditsProvider = ({ children }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const res = await handleCreditConfig();
                setData(res.data);
            } catch (err) {
                console.error(err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCredits();
    }, []);

    const getCreditKey = (type) => {
        if (!data) return undefined;

        return Object.entries(data).find(
            ([_, credit]) => credit.meta?.path === type
        )?.[0];
    };
    const getCredit = (type) => {
        if (!data) return null;

        return Object.values(data).find(
            (credit) => credit.meta?.path === type
        ) ?? null;
    };
    const getMeta = (type) => getCredit(type)?.meta ?? null;
    const getParameters = (type) => getCredit(type)?.parameters ?? null;

    return (
        <CreditsContext.Provider
            value={{
                data,
                loading,
                error,
                getCreditKey,
                getCredit,
                getMeta,
                getParameters,
            }}
        >
            {children}
        </CreditsContext.Provider>
    );
};

export const useCredits = () => {
    const context = useContext(CreditsContext);
    if (!context) {
        throw new Error("useCredits debe usarse dentro de CreditsProvider");
    }
    return context;
};