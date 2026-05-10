import { useParams } from "react-router-dom";
import { useCredits } from "context/creditsContext";

export const useCredit = () => {
    const { creditType: pathType } = useParams();
    const { getCredit, getCreditKey, getMeta, getParameters, loading, error } = useCredits();

    return {
        loading,
        error,
        pathType: pathType,
        credit: getCredit(pathType),
        creditType: getCreditKey(pathType),
        creditMeta: getMeta(pathType),
        creditParameters: getParameters(pathType),
    };
};