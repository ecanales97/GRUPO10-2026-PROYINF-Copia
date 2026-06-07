import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "./db.js";
import { getAll, getByCode } from "./cache.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const DOCUMENTS_DIR = path.resolve("documents");

if (!fs.existsSync(DOCUMENTS_DIR)) {
    fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
}

export const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowed = ["image/png", "image/jpeg", "application/pdf"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Formato inválido, debe ser png, jpeg o pdf."));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 },
});

const MIME_BY_EXT = {
    ".pdf":  "application/pdf",
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
};

export const resolveFile = (fieldValue, index = 0) => {
    if (fieldValue?.buffer) return fieldValue;

    if (Array.isArray(fieldValue)) {
        const item = fieldValue[index];
        if (!item) throw new Error(`resolveFile: no hay archivo en índice ${index}`);
        return resolveFile(item);
    }

    if (fieldValue?.uploaded && fieldValue?.url) {
        const fullPath = path.resolve(fieldValue.url);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`Archivo no encontrado en disco: ${fieldValue.url}`);
        }
        const ext      = path.extname(fieldValue.name ?? fieldValue.url).toLowerCase();
        const mimetype = MIME_BY_EXT[ext] ?? "application/octet-stream";
        return {
            buffer:       fs.readFileSync(fullPath),
            mimetype,
            originalname: fieldValue.name ?? path.basename(fieldValue.url),
        };
    }

    throw new Error("resolveFile: valor de campo inválido");
};

export const resolveAllFiles = (fieldValue) => {
    if (Array.isArray(fieldValue)) return fieldValue.map((item) => resolveFile(item));
    return [resolveFile(fieldValue)];
};

const genAI    = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const BASE_PROMPT = `
Eres un extractor de datos de documentos. Tu única tarea es leer el documento
y devolver EXCLUSIVAMENTE un JSON plano con los campos solicitados, sin texto
adicional, sin explicaciones, sin markdown.

Reglas:
- Si un campo no se encuentra en el documento, usa null.
- No inventes ni supongas valores.
- Normaliza los RUT chilenos con guión y dígito verificador (ej: 12.345.678-9).
- Las fechas en formato DD-MM-AAAA salvo que se indique otro formato.
- Elimina espacios extra y caracteres extraños en los valores.
- TODOS LOS RESULTADOS DEBEN SER STRINGS, incluso si son claramente numeros, es necesario que sean strings.
- Si alguno de los resultados es monetario (dinero, salario, ingreso, mensualidad, etc.), entonces debe tener coma cada 3 numeros, por ejemplo: 1000 -> 1,000; 199900 -> 199,900, y asi.
`.trim();

export const scanDocument = async (fieldValue, prompt, schema, index = 0) => {
    const file  = resolveFile(fieldValue, index);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    const schemaDescription = Object.entries(schema)
        .map(([key, description]) => `- "${key}": ${description}`)
        .join("\n");

    const fullPrompt = `
${BASE_PROMPT}

${prompt}

Devuelve exactamente este JSON con estos campos:
${schemaDescription}

Ejemplo de estructura (no uses estos valores):
${JSON.stringify(Object.fromEntries(Object.keys(schema).map((k) => [k, null])), null, 2)}
`.trim();

    const base64 = file.buffer.toString("base64");
    const result = await model.generateContent({
        contents: [{
            role: "user",
            parts: [
                { text: fullPrompt },
                { inlineData: { data: base64, mimeType: file.mimetype } },
            ],
        }],
        generationConfig: { responseMimeType: "application/json" },
    });

    const text      = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
};

export const saveDocument = async (fieldValue, documentTypeCode, { clientId = null, applicationId = null, dbClient = null } = {}, index = 0) => {
    const file = resolveFile(fieldValue, index);

    const ext      = path.extname(file.originalname) || ".pdf";
    const unique   = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const filename = `${unique}${ext}`;
    const filepath = path.join(DOCUMENTS_DIR, filename);
    const url      = path.join("documents", filename);

    fs.writeFileSync(filepath, file.buffer);

    const documentType = await getByCode("documentTypes", documentTypeCode);
    if (!documentType) throw new Error(`documentType '${documentTypeCode}' no encontrado en cache`);

    const source = await getByCode("documentSources", "CLIENT");
    if (!source) throw new Error(`documentSource 'CLIENT' no encontrado en cache`);

    const q = dbClient ?? db;
    const { rows } = await q.query(`
        INSERT INTO documents (clientId, applicationId, documentTypeId, sourceId, url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `, [clientId, applicationId, documentType.id, source.id, url]);

    return rows[0];
};

export const getDocument = async (documentId) => {
    const { rows } = await db.query(`
        SELECT * FROM documents
        WHERE id = $1 AND deletedAt IS NULL
    `, [documentId]);

    if (!rows.length) return null;

    const doc      = rows[0];
    const fullPath = path.resolve(doc.url);

    if (!fs.existsSync(fullPath)) return null;

    return { ...doc, fullPath };
};

export const getDocumentByPath = async (urlOrPath, { checkDb = false } = {}) => {
    const relativePath = path.isAbsolute(urlOrPath)
        ? path.relative(process.cwd(), urlOrPath)
        : urlOrPath;

    const fullPath = path.resolve(relativePath);

    if (!fs.existsSync(fullPath)) return null;

    const ext      = path.extname(relativePath).toLowerCase();
    const mimetype = MIME_BY_EXT[ext] ?? "application/octet-stream";
    const buffer   = fs.readFileSync(fullPath);

    let meta = null;
    if (checkDb) {
        const { rows } = await db.query(`
            SELECT * FROM documents
            WHERE url = $1 AND deletedAt IS NULL
        `, [relativePath]);
        meta = rows[0] ?? null;
    }

    return {
        ...( meta ?? {} ),
        url:          relativePath,
        fullPath,
        buffer,
        mimetype,
        originalname: path.basename(relativePath),
    };
};

// ESCANEOS DE DOCUMENTOS IMPLEMENTADOS

export const scanner = {
    employment: async (fieldValue, index = 0) => {
        const [jobTypes, contractTypes] = await Promise.all([
            getAll('jobTypes'),
            getAll('contractTypes'),
        ]);
    
        const jobTypeList      = jobTypes.map((j) => j.id + ' = ' + j.name).join(', ');
        const contractTypeList = contractTypes.map((c) => c.id + ' = ' + c.name + ' (' + c.code + ')').join(', ');
    
        const prompt = 'Estas analizando un documento laboral chileno (puede ser un contrato, liquidacion de sueldo, o certificado de trabajo). Extrae los datos de empleo del trabajador.';
    
        const schema = {
            jobTypeId:      'ID numerico del tipo de trabajo segun esta lista: ' + jobTypeList + '. Elige el que mejor corresponda, o null si no se puede determinar.',
            contractTypeId: 'ID numerico del tipo de contrato segun esta lista: ' + contractTypeList + '. Elige el que mejor corresponda, o null si no se puede determinar.',
            salary:         'Remuneracion mensual bruta en pesos chilenos como numero entero, sin puntos ni simbolos. null si no aparece.',
            startDate:      'Fecha de inicio del contrato o relacion laboral en formato YYYY-MM-DD (ISO 8601). null si no aparece.',
        };

        const res = await scanDocument(fieldValue, prompt, schema, index);
    
        return res;
    },

    income: async (fieldValue, index = 0) => {
        const incomeTypes = await getAll('incomeTypes');

        const incomeTypeList = incomeTypes.map((i) => i.id + " = " + i.name).join(',');

        const prompt = 'Estás analizando un documento chileno que acredita ingresos no laborales. Extrae los datos de ingresos externos al empleo dependiente e identifica su origen, monto y periodicidad cuando estén disponibles.';

        const schema = {
            monthlyIncome: 'Ingreso mensual en pesos chilenos como numero entero, sin puntos ni simbolos. Si el documento indica otro periodo (diario, semanal, anual, etc.), conviertelo a un monto mensual estimado. null si no aparece.',
            incomeTypeId:  'ID numerico del tipo de ingreso segun esta lista: ' + incomeTypeList + '. Elige el que mejor corresponda, o null si no se puede determinar.',
            isRecurring:   'true si el ingreso es recurrente o periodico, false si es esporadico u ocasional. null si no se puede determinar.',
        };

        const res = await scanDocument(fieldValue, prompt, schema, index);
        return res;
    }
};

export const prepareDocument = async (fieldValue, documentTypeCode, { clientId = null, applicationId = null } = {}, index = 0) => {
    const file = resolveFile(fieldValue, index);

    const ext      = path.extname(file.originalname) || ".pdf";
    const unique   = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const filename = `${unique}${ext}`;
    const filepath = path.join(DOCUMENTS_DIR, filename);
    const url      = path.join("documents", filename).replace(/\\/g, "/");

    const documentType = await getByCode("documentTypes", documentTypeCode);
    if (!documentType) throw new Error(`documentType '${documentTypeCode}' no encontrado en cache`);

    const source = await getByCode("documentSources", "CLIENT");
    if (!source) throw new Error(`documentSource 'CLIENT' no encontrado en cache`);

    return {
        buffer:         file.buffer,
        filepath,
        url,
        documentTypeId: documentType.id,
        sourceId:       source.id,
        clientId,
        applicationId,
    };
};

export const commitDocument = (prepared) => {
    fs.writeFileSync(prepared.filepath, prepared.buffer);
};

export const deleteDocument = (url) => {
    try {
        const filepath = path.resolve(url);
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    } catch {
        console.error(`deleteDocumentFromDisk: no se pudo borrar ${url}`);
    }
};