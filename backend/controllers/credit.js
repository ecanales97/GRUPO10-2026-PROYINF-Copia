import { getCreditsConfig } from "../utils/getData.js";

export const creditsConfig = async (req, res) => {
    const { creditType } = req.params;
    const creditsConfig = getCreditsConfig(creditType);
    
    if (!creditsConfig) {
        return res.status(404).json({
            error: "No se encontró el tipo de crédito solicitado"
        });
    }
    res.json({
        data: creditsConfig
    });
}