import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODOS_CONFIG = {
    carnet: {
        titulo: "Cédula de Identidad",
        icono: "🪪",
        prompt: `Analiza esta cédula de identidad chilena.Es crítico que el RUN y el N° de Serie (documento) sean exactos. Extrae en JSON plano: 
        {"run": "RUT", "nombres": "Nombres", "apellidos": "Paterno y Materno", "serie": "N° Documento", "vencimiento": "DD-MM-AAAA", "nacionalidad":"País de origen"}`,
        campos: [
            { label: "RUT", key: "run", icon: "🆔" },
            { label: "Nombres", key: "nombres", icon: "👤" },
            { label: "Apellidos", key: "apellidos", icon: "🧬" },
            { label: "N° Serie", key: "serie", icon: "📜" },
            { label: "Vencimiento", key: "vencimiento", icon: "🗓️" },
            { label: "Nacionalidad", key: "nacionalidad", icon: "🗺️"}
        ]
    },
    liquidaciones: {
        titulo: "Liquidaciones de Sueldo",
        icono: "💰",
        prompt: `Analiza esta liquidación de sueldo. Extrae en JSON plano:
        {"empresa": "Nombre empresa", "mes": "Mes/Año", "liquido": "Monto líquido a pagar", "haberes": "Total haberes", "nombre":"Nombre completo de la persona", "rut": "RUT"}`,
        campos: [
            { label: "Empresa", key: "empresa", icon: "🏢" },
            { label: "Periodo", key: "mes", icon: "📅" },
            { label: "Sueldo Líquido", key: "liquido", icon: "💵" },
            { label: "Total Haberes", key: "haberes", icon: "📈" },
            { label: "RUT", key: "rut", icon: "🆔" },
            { label: "Nombre del trabajador", key: "nombre", icon: "👤" },
        ]
    },
    afp: {
        titulo: "Certificado AFP",
        icono: "🏦",
        prompt: `Analiza este certificado de cotizaciones AFP. Extrae en JSON plano:
        {"afp": "Nombre AFP", "meses_cotizados": "Número total de meses", "renta_imponible": "Última renta imponible", "nombre":"Nombre completo de la persona", "rut": "RUT"}`,
        campos: [
            { label: "Institución", key: "afp", icon: "🏛️" },
            { label: "Meses Totales", key: "meses_cotizados", icon: "📊" },
            { label: "Renta Imponible", key: "renta_imponible", icon: "💎" },
            { label: "RUT", key: "rut", icon: "🆔" },
            { label: "Nombre del trabajador", key: "nombre", icon: "👤" },
        ]
    },
    domicilio: {
        titulo: "Comprobante Domicilio",
        icono: "🏠",
        prompt: `Analiza este documento. Enfocate en extraer la direccion y nombre de la persona. Extrae en JSON plano:
        {"titular": "Nombre completo", "direccion": "Dirección completa", "comuna": "Comuna"}`,
        campos: [
            { label: "Titular", key: "titular", icon: "👤" },
            { label: "Dirección", key: "direccion", icon: "📍" },
            { label: "Comuna", key: "comuna", icon: "🗺️" }
        ]
    }
};

export const document = async (req, res) => {
    try {
        const { documentType } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: "No file provided" });
        }

        const config = MODOS_CONFIG[documentType];
        if (!config) {
            return res.status(400).json({ error: "Invalid document type" });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-lite"
        });

        const base64 = file.buffer.toString("base64");
        const result = await model.generateContent({
            contents: [
                {
                role: "user",
                parts: [
                    { text: config.prompt },
                    {
                    inlineData: {
                        data: base64,
                        mimeType: file.mimetype
                    }
                    }
                ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const text = result.response.text();
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const cleanJson = jsonMatch ? jsonMatch[0] : text;
            res.json(JSON.parse(cleanJson));
        } catch (parseError) {
            res.status(500).json({ error: "Error parseando la respuesta de IA", raw: text });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error procesando documento" });
    }
};

export const getDocumentsConfig = (req, res) => {
    try {
        const cleanConfig = Object.entries(MODOS_CONFIG).reduce((acc, [key, value]) => {
            const { prompt, ...rest } = value;
            acc[key] = rest;
            return acc;
        }, {});

        res.json(cleanConfig);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error obteniendo tipos de documento" });
    }
};