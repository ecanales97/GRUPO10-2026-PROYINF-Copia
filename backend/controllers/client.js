import { db } from "../utils/db.js";
import { getClientDataByUserId } from "../utils/getData.js";
import { validations, objectValidations } from "../shared/schemas/schema.js";
import { prepareDocument, commitDocument, deleteDocument } from "../utils/documents.js";
import { validate, validateUniqueEmail } from "../utils/validateData.js";
import { getById, getByCode, getOptions } from "../utils/cache.js";
import bcrypt from "bcrypt";

// DB
const withDb = async (externalDb, fn, { transaction = true } = {}) => {
    if (externalDb) return fn(externalDb);
    const client = await db.connect();
    try {
        if (transaction) await client.query("BEGIN");
        const result = await fn(client);
        if (transaction) await client.query("COMMIT");
        return result;
    } catch (err) {
        if (transaction) await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

const notFound = (label) =>
    Object.assign(new Error(`${label} no encontrado o no pertenece al usuario`), { status: 404 });

// CACHE
const resolveStateId = async (code) => {
    const s = await getByCode("verificationStates", code);
    if (!s) throw new Error(`verificationState '${code}' no encontrado en cache`);
    return s.id;
};

const resolveSourceId = async (code) => {
    const s = await getByCode("clientDataSources", code);
    if (!s) throw new Error(`clientDataSource '${code}' no encontrado en cache`);
    return s.id;
};

// DOCUMENT
const insertDocument = async (fileField, category, { clientId, applicationId } = {}, verificationStateId, dbConn, metadata = null) => {
    if (!fileField) return { id: null, prepared: null };

    const prepared   = await prepareDocument(fileField, category, { clientId, applicationId });
    const isVerified = verificationStateId === await resolveStateId("VERIFIED");

    const { rows } = await dbConn.query(`
        INSERT INTO documents (clientId, applicationId, documentTypeId, sourceId, url, verificationStateId, verifiedAt, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
    `, [prepared.clientId, prepared.applicationId, prepared.documentTypeId, prepared.sourceId, prepared.url, verificationStateId, isVerified ? new Date() : null, metadata ? JSON.stringify(metadata) : null]);

    return { id: rows[0].id, prepared };
};

// VERIFICATION
const resolveVerification = (parsed, scan, fields, formData = {}) => {
    const explicitSource = formData?.sourceCode ?? formData?.source ?? formData?.documentSource ?? null;
    const explicitState  = formData?.verificationState ?? formData?.stateCode ?? formData?.state ?? null;

    const sourceCode = explicitSource ? String(explicitSource).toUpperCase() : (scan ? "DOCUMENT" : "MANUAL");
    const stateCode  = explicitState ? String(explicitState).toUpperCase() : "PENDING";

    return { stateCode, sourceCode };
};

// ENRICH
const pickRef = (obj, fields) =>
    Object.fromEntries(fields.filter((f) => f in obj).map((f) => [f, obj[f]]));

const enrichRows = async (rows, { hasSource, hasDocument, hasVerificationState }, dbConn) => {
    if (!rows.length) return rows;

    let docsById = {};
    if (hasDocument) {
        const ids = [...new Set(rows.map((r) => r.documentid).filter(Boolean))];
        if (ids.length) {
            const { rows: docRows } = await (dbConn ?? db).query(`
                SELECT d.id, d.url, d.sourceid, d.documenttypeid, d.verifiedat, d.updatedat, d.createdat
                FROM documents d WHERE d.id = ANY($1) AND d.deletedat IS NULL
            `, [ids]);
            for (const d of docRows) docsById[d.id] = d;
        }
    }

    return Promise.all(rows.map(async (row) => {
        const out = { ...row };

        if (hasSource && !row.documentid) {
            const src = await getById("clientDataSources", row.sourceid);
            out.source = src ? pickRef(src, ["id", "code", "name"]) : null;
        }
        delete out.sourceid;

        if (hasDocument) {
            const doc = row.documentid ? docsById[row.documentid] : null;
            out.document = doc ? {
                id:             doc.id,
                url:            doc.url,
                documentType:   pickRef(await getById("documentTypes",   doc.documenttypeid) ?? {}, ["id", "code", "name"]),
                documentSource: pickRef(await getById("documentSources", doc.sourceid)       ?? {}, ["id", "code", "name"]),
                verifiedAt:     doc.verifiedat,
                updatedAt:      doc.updatedat,
                createdAt:      doc.createdat,
            } : null;
            delete out.documentid;
        }

        if (hasVerificationState) {
            const vs = await getById("verificationStates", row.verificationstateid);
            out.verificationState = vs ? pickRef(vs, ["id", "code", "name"]) : null;
            delete out.verificationstateid;
        }

        return out;
    }));
};

// GENERIC HANDLERS
const genericGet = (table, alias, enrichConfig) => async (req, res) => {
    try {
        const { rows } = await (req.dbClient ?? db).query(`
            SELECT ${alias}.* FROM ${table} ${alias}
            JOIN clients c ON c.id = ${alias}.clientId
            WHERE c.userId = $1 AND ${alias}.deletedAt IS NULL
        `, [req.user.sub]);
        return res.json(await enrichRows(rows, enrichConfig, req.dbClient));
    } catch (err) {
        return res.status(err.status ?? 500).json({ error: err.message });
    }
};

const genericDelete = (table, alias, label) => async (req, res) => {
    try {
        const { rowCount } = await (req.dbClient ?? db).query(`
            UPDATE ${table} ${alias} SET deletedAt = NOW()
            FROM clients c
            WHERE ${alias}.id = $1 AND ${alias}.clientId = c.id AND c.userId = $2 AND ${alias}.deletedAt IS NULL
        `, [req.params.id, req.user.sub]);
        if (rowCount === 0) throw notFound(label);
        return res.json({ message: `${label} eliminado` });
    } catch (err) {
        return res.status(err.status ?? 500).json({ error: err.message });
    }
};

const genericDeleteWithDocument = (table, alias, label) => async (req, res) => {
    let docUrl = null;
    try {
        await withDb(req.dbClient, async (dbConn) => {
            const { rows } = await dbConn.query(`
                SELECT d.url FROM ${table} ${alias}
                JOIN clients c ON c.id = ${alias}.clientId
                LEFT JOIN documents d ON d.id = ${alias}.documentId
                WHERE ${alias}.id = $1 AND c.userId = $2 AND ${alias}.deletedAt IS NULL
            `, [req.params.id, req.user.sub]);

            if (!rows.length) throw notFound(label);
            docUrl = rows[0].url ?? null;

            await dbConn.query(`
                UPDATE ${table} ${alias} SET deletedAt = NOW()
                FROM clients c
                WHERE ${alias}.id = $1 AND ${alias}.clientId = c.id AND c.userId = $2 AND ${alias}.deletedAt IS NULL
            `, [req.params.id, req.user.sub]);

            if (docUrl) await dbConn.query(
                `UPDATE documents SET deletedAt = NOW() WHERE url = $1`, [docUrl]
            );
            
            if (docUrl) deleteDocument(docUrl);
        });

        return res.json({ message: `${label} eliminado` });
    } catch (err) {
        return res.status(err.status ?? 500).json({ error: err.message });
    }
};

// ALL
export const getMeAll = async (req, res) => {
    try {
        const user = await getClientDataByUserId(req.user.sub);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
        return res.json(user);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// CLIENT
export const getClient = async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT c.id, c.nationalId, c.birthDate, c.maritalStatusId
            FROM clients c WHERE c.userId = $1 AND c.deletedAt IS NULL
        `, [req.user.sub]);
        if (!rows.length) return res.status(404).json({ error: "Cliente no encontrado" });
        return res.json(rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// IDENTITY
export const updateClientIdentity = async (req, res) => {
    try {
        const formData     = req.formData ?? req.body ?? {};
        const incomingKeys = new Set(Object.keys(formData));

        const parsed = validate({
            name:            validations.name().optional(),
            nickname:        validations.nickname().optional(),
            birthDate:       validations.birthDate().optional(),
            maritalStatusId: validations.select(await getOptions("clientMaritalStatus")).optional(),
        }, formData);

        const pick = (obj) => Object.fromEntries(Object.entries(obj).filter(([k]) => incomingKeys.has(k)));
        const { name, nickname, birthDate, maritalStatusId } = pick(parsed);

        const result = await withDb(req.dbClient, async (dbConn) => {
            const { rows: u } = await dbConn.query(`
                UPDATE users SET name = COALESCE($1, name), nickname = COALESCE($2, nickname), updatedAt = NOW()
                WHERE id = $3 AND deletedAt IS NULL RETURNING id, name, nickname
            `, [name ?? null, nickname ?? null, req.user.sub]);
            if (!u.length) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });

            const { rows: c } = await dbConn.query(`
                UPDATE clients SET birthDate = COALESCE($1, birthDate), maritalStatusId = COALESCE($2, maritalStatusId), updatedAt = NOW()
                WHERE userId = $3 AND deletedAt IS NULL RETURNING birthDate, maritalStatusId
            `, [birthDate ?? null, maritalStatusId ?? null, req.user.sub]);

            return { ...u[0], ...c[0] };
        });

        return res.json(result);
    } catch (err) {
        return res.status(err.status ?? 500).json({ error: err.message });
    }
};

// CONTACT
export const updateClientContact = async (req, res) => {
    try {
        const formData     = req.formData ?? req.body ?? {};
        const incomingKeys = new Set(Object.keys(formData));

        const parsed = validate({
            email: validations.email().optional(),
            phone: validations.phone().optional(),
        }, formData);

        const { email, phone } = Object.fromEntries(Object.entries(parsed).filter(([k]) => incomingKeys.has(k)));

        if (email) await validateUniqueEmail(email, req.user.sub);

        const { rows } = await db.query(`
            UPDATE users SET email = COALESCE($1, email), phone = COALESCE($2, phone), updatedAt = NOW()
            WHERE id = $3 AND deletedAt IS NULL RETURNING id, email, phone
        `, [email ?? null, phone ?? null, req.user.sub]);

        if (!rows.length) return res.status(404).json({ error: "Usuario no encontrado" });
        return res.json(rows[0]);
    } catch (err) {
        return res.status(err.status ?? 500).json({ error: err.message });
    }
};

// PASSWORD
export const updateClientPassword = async (req, res) => {
    try {
        const { password } = validate({
            password:        validations.password(),
            confirmPassword: validations.confirmPassword(),
        }, req.body, [objectValidations.newConfirmPassword()]);

        const hashedPassword = await bcrypt.hash(password, 10);

        const { rows } = await db.query(`
            UPDATE users SET passwordHash = $1, updatedAt = NOW()
            WHERE id = $2 AND deletedAt IS NULL RETURNING id
        `, [hashedPassword, req.user.sub]);

        if (!rows.length) return res.status(404).json({ error: "Usuario no encontrado" });
        return res.json({ message: "Contraseña actualizada" });
    } catch (err) {
        return res.status(err.status ?? 500).json({ error: err.message });
    }
};

// DELETE CLIENT
export const deleteClient = async (req, res) => {
    try {
        const result = await withDb(req.dbClient, async (dbConn) => {
            const { rowCount } = await dbConn.query(`
                UPDATE clients SET deletedAt = NOW() WHERE userId = $1 AND deletedAt IS NULL
            `, [req.user.sub]);
            if (rowCount === 0) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });
            await dbConn.query(`UPDATE users SET deletedAt = NOW() WHERE id = $1 AND deletedAt IS NULL`, [req.user.sub]);
            return { message: "Cliente eliminado" };
        });
        return res.json(result);
    } catch (err) {
        return res.status(err.status ?? 500).json({ error: err.message });
    }
};

// INCOME
const incomeEnrich     = { hasSource: true, hasDocument: true, hasVerificationState: true };
const incomeScanFields = [
    { key: "monthlyIncome", type: "num"    },
    { key: "incomeTypeId",  type: "option" },
];

export const getClientIncome    = genericGet("clientIncome", "ci", incomeEnrich);
export const deleteClientIncome = genericDeleteWithDocument("clientIncome", "ci", "Ingreso");

export const createClientIncome = async ({ userId, formData = {}, db: externalDb } = {}) => {
    let prepared = null;
    try {
        return await withDb(externalDb, async (dbConn) => {
            const parsed = validate({
                monthlyIncome: validations.monthlyIncome(),
                incomeTypeId:  validations.incomeType(await getOptions("incomeTypes")),
                isRecurring:   validations.isRecurring().optional(),
            }, formData);

            const { rows: cr } = await dbConn.query(
                `SELECT id FROM clients WHERE userId = $1 AND deletedAt IS NULL`, [userId]
            );
            if (!cr.length) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });
            const clientId = cr[0].id;

            const { stateCode, sourceCode } = resolveVerification(parsed, formData.scan ?? null, incomeScanFields, formData);
            const verificationStateId       = await resolveStateId(stateCode);
            const sourceId                  = await resolveSourceId(sourceCode);

            const { id: documentId, prepared: p } = await insertDocument(
                formData.document ?? null, "INCOME_PROOF", { clientId }, verificationStateId, dbConn, formData.scan ?? null
            );
            prepared = p;

            const { rows } = await dbConn.query(`
                INSERT INTO clientIncome (clientId, monthlyIncome, incomeTypeId, isRecurring, sourceId, documentId, verificationStateId)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            `, [clientId, parsed.monthlyIncome, parsed.incomeTypeId, parsed.isRecurring ?? false, sourceId, documentId, verificationStateId]);

            if (prepared) commitDocument(prepared);

            const [enriched] = await enrichRows(rows, incomeEnrich, dbConn);
            return enriched;
        });
    } catch (err) {
        if (prepared) deleteDocument(prepared.filepath);
        throw err;
    }
};

// EMPLOYMENT
const employmentEnrich     = { hasSource: true, hasDocument: true, hasVerificationState: true };
const employmentScanFields = [
    { key: "salary",         type: "num"    },
    { key: "jobTypeId",      type: "option" },
    { key: "contractTypeId", type: "option" },
];

export const getClientEmployment    = genericGet("clientEmployment", "ce", employmentEnrich);
export const deleteClientEmployment = genericDeleteWithDocument("clientEmployment", "ce", "Empleo");

export const createClientEmployment = async ({ userId, formData = {}, db: externalDb } = {}) => {
    let prepared = null;
    try {
        return await withDb(externalDb, async (dbConn) => {
            const parsed = validate({
                jobTypeId:      validations.select(await getOptions("jobTypes")),
                contractTypeId: validations.select(await getOptions("contractTypes")),
                salary:         validations.salary(),
                startDate:      validations.jobStartDate(),
            }, formData);

            const { rows: cr } = await dbConn.query(
                `SELECT id FROM clients WHERE userId = $1 AND deletedAt IS NULL`, [userId]
            );
            if (!cr.length) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });
            const clientId = cr[0].id;

            const { stateCode, sourceCode } = resolveVerification(parsed, formData.scan ?? null, employmentScanFields, formData);
            const verificationStateId       = await resolveStateId(stateCode);
            const sourceId                  = await resolveSourceId(sourceCode);

            const { id: documentId, prepared: p } = await insertDocument(
                formData.document ?? null, "CONTRACT", { clientId }, verificationStateId, dbConn, formData.scan ?? null
            );
            prepared = p;

            const { rows } = await dbConn.query(`
                INSERT INTO clientEmployment (clientId, jobTypeId, contractTypeId, salary, startDate, sourceId, documentId, verificationStateId)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
            `, [clientId, parsed.jobTypeId, parsed.contractTypeId, parsed.salary, parsed.startDate, sourceId, documentId, verificationStateId]);

            if (prepared) commitDocument(prepared);

            const [enriched] = await enrichRows(rows, employmentEnrich, dbConn);
            return enriched;
        });
    } catch (err) {
        if (prepared) deleteDocument(prepared.filepath);
        throw err;
    }
};

// ASSETS
const assetEnrich     = { hasSource: true, hasDocument: true, hasVerificationState: true };
const assetScanFields = [
    { key: "value",               type: "num"    },
    { key: "ownershipPercentage", type: "num"    },
    { key: "assetTypeId",         type: "option" },
];

export const getClientAssets   = genericGet("clientAssets", "ca", assetEnrich);
export const deleteClientAsset = genericDeleteWithDocument("clientAssets", "ca", "Activo");

export const createClientAsset = async ({ userId, formData = {}, db: externalDb } = {}) => {
    let prepared = null;
    try {
        return await withDb(externalDb, async (dbConn) => {
            const parsed = validate({
                assetTypeId:         validations.select(await getOptions("assetTypes")),
                value:               validations.assetValue(),
                ownershipPercentage: validations.ownershipPercentage().optional(),
                documentCategory:    validations.documentCategory().optional(),
            }, formData);

            const { rows: cr } = await dbConn.query(
                `SELECT id FROM clients WHERE userId = $1 AND deletedAt IS NULL`, [userId]
            );
            if (!cr.length) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });
            const clientId = cr[0].id;

            const category = parsed.documentCategory ?? "PROPERTY_APPRAISAL";

            const { stateCode, sourceCode } = resolveVerification(parsed, formData.scan ?? null, assetScanFields, formData);
            const verificationStateId       = await resolveStateId(stateCode);
            const sourceId                  = await resolveSourceId(sourceCode);

            const { id: documentId, prepared: p } = await insertDocument(
                formData.document ?? null, category, { clientId }, verificationStateId, dbConn, formData.scan ?? null
            );
            prepared = p;

            const { rows } = await dbConn.query(`
                INSERT INTO clientAssets (clientId, assetTypeId, value, ownershipPercentage, sourceId, documentId, verificationStateId)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            `, [clientId, parsed.assetTypeId, parsed.value, parsed.ownershipPercentage ?? 100, sourceId, documentId, verificationStateId]);

            if (prepared) commitDocument(prepared);

            const [enriched] = await enrichRows(rows, assetEnrich, dbConn);
            return enriched;
        });
    } catch (err) {
        if (prepared) deleteDocument(prepared.filepath);
        throw err;
    }
};

export const updateClientAsset = async ({ id, userId, formData = {}, db: externalDb } = {}) => {
    return withDb(externalDb, async (dbConn) => {
        const incomingKeys = new Set(Object.keys(formData));

        const parsed = validate({
            assetTypeId:         validations.select(await getOptions("assetTypes")).optional(),
            value:               validations.assetValue().optional(),
            ownershipPercentage: validations.ownershipPercentage().optional(),
        }, formData);

        const p = Object.fromEntries(Object.entries(parsed).filter(([k]) => incomingKeys.has(k)));

        const { rows } = await dbConn.query(`
            UPDATE clientAssets ca SET
                assetTypeId         = COALESCE($1, ca.assetTypeId),
                value               = COALESCE($2, ca.value),
                ownershipPercentage = COALESCE($3, ca.ownershipPercentage),
                updatedAt           = NOW()
            FROM clients c
            WHERE ca.id = $4 AND ca.clientId = c.id AND c.userId = $5 AND ca.deletedAt IS NULL
            RETURNING ca.*
        `, [p.assetTypeId ?? null, p.value ?? null, p.ownershipPercentage ?? null, id, userId]);

        if (!rows.length) throw notFound("Activo");
        const [enriched] = await enrichRows(rows, assetEnrich, dbConn);
        return enriched;
    });
};

// PAYMENT METHODS
const paymentEnrich = { hasSource: false, hasDocument: false, hasVerificationState: false };

export const getClientPaymentMethods   = genericGet("clientPaymentMethods", "cpm", paymentEnrich);
export const deleteClientPaymentMethod = genericDelete("clientPaymentMethods", "cpm", "Método de pago");

export const createClientPaymentMethod = async ({ userId, formData = {}, db: externalDb } = {}) => {
    return withDb(externalDb, async (dbConn) => {
        const parsed = validate({
            bankId:     validations.select(await getOptions("bankTypes")),
            typeId:     validations.select(await getOptions("paymentMethodTypes")).optional(),
            brandId:    validations.select(await getOptions("brandTypes")).optional(),
            holderName: validations.holderName().optional(),
            last4:      validations.last4().optional(),
            alias:      validations.alias().optional(),
        }, formData);

        const { rows: cr } = await dbConn.query(
            `SELECT id FROM clients WHERE userId = $1 AND deletedAt IS NULL`, [userId]
        );
        if (!cr.length) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });

        const { rows } = await dbConn.query(`
            INSERT INTO clientPaymentMethods (clientId, bankId, typeId, brandId, holderName, last4, alias, provider, providerPaymentMethodId)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'internal', NULL) RETURNING *
        `, [cr[0].id, parsed.bankId, parsed.typeId ?? null, parsed.brandId ?? null, parsed.holderName ?? null, parsed.last4 ?? null, parsed.alias ?? null]);

        return rows[0];
    });
};

export const updateClientPaymentMethod = async ({ id, userId, formData = {}, db: externalDb } = {}) => {
    return withDb(externalDb, async (dbConn) => {
        const incomingKeys = new Set(Object.keys(formData));

        const parsed = validate({
            bankId:     validations.select(await getOptions("bankTypes")).optional(),
            typeId:     validations.select(await getOptions("paymentMethodTypes")).optional(),
            brandId:    validations.select(await getOptions("brandTypes")).optional(),
            holderName: validations.holderName().optional(),
            last4:      validations.last4().optional(),
            alias:      validations.alias().optional(),
        }, formData);

        const p = Object.fromEntries(Object.entries(parsed).filter(([k]) => incomingKeys.has(k)));

        const { rows } = await dbConn.query(`
            UPDATE clientPaymentMethods cpm SET
                bankId     = COALESCE($1, cpm.bankId),
                typeId     = COALESCE($2, cpm.typeId),
                brandId    = COALESCE($3, cpm.brandId),
                holderName = COALESCE($4, cpm.holderName),
                last4      = COALESCE($5, cpm.last4),
                alias      = COALESCE($6, cpm.alias),
                updatedAt  = NOW()
            FROM clients c
            WHERE cpm.id = $7 AND cpm.clientId = c.id AND c.userId = $8 AND cpm.deletedAt IS NULL
            RETURNING cpm.*
        `, [p.bankId ?? null, p.typeId ?? null, p.brandId ?? null, p.holderName ?? null, p.last4 ?? null, p.alias ?? null, id, userId]);

        if (!rows.length) throw notFound("Método de pago");
        return rows[0];
    });
};

// DISBURSEMENT METHODS
const disbursementEnrich = { hasSource: false, hasDocument: false, hasVerificationState: false };

export const getClientDisbursementMethods   = genericGet("clientDisbursementMethods", "cdm", disbursementEnrich);
export const deleteClientDisbursementMethod = genericDelete("clientDisbursementMethods", "cdm", "Método de desembolso");

export const createClientDisbursementMethod = async ({ userId, formData = {}, db: externalDb } = {}) => {
    return withDb(externalDb, async (dbConn) => {
        const parsed = validate({
            bankId:     validations.select(await getOptions("bankTypes")),
            typeId:     validations.select(await getOptions("disbursementMethodTypes")).optional(),
            brandId:    validations.select(await getOptions("brandTypes")).optional(),
            holderName: validations.holderName().optional(),
            last4:      validations.last4().optional(),
            alias:      validations.alias().optional(),
        }, formData);

        const { rows: cr } = await dbConn.query(
            `SELECT id FROM clients WHERE userId = $1 AND deletedAt IS NULL`, [userId]
        );
        if (!cr.length) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });

        const { rows } = await dbConn.query(`
            INSERT INTO clientDisbursementMethods (clientId, bankId, typeId, brandId, holderName, last4, alias)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `, [cr[0].id, parsed.bankId, parsed.typeId ?? null, parsed.brandId ?? null, parsed.holderName ?? null, parsed.last4 ?? null, parsed.alias ?? null]);

        return rows[0];
    });
};

export const updateClientDisbursementMethod = async ({ id, userId, formData = {}, db: externalDb } = {}) => {
    return withDb(externalDb, async (dbConn) => {
        const incomingKeys = new Set(Object.keys(formData));

        const parsed = validate({
            bankId:     validations.select(await getOptions("bankTypes")).optional(),
            typeId:     validations.select(await getOptions("disbursementMethodTypes")).optional(),
            brandId:    validations.select(await getOptions("brandTypes")).optional(),
            holderName: validations.holderName().optional(),
            last4:      validations.last4().optional(),
            alias:      validations.alias().optional(),
        }, formData);

        const p = Object.fromEntries(Object.entries(parsed).filter(([k]) => incomingKeys.has(k)));

        const { rows } = await dbConn.query(`
            UPDATE clientDisbursementMethods cdm SET
                bankId     = COALESCE($1, cdm.bankId),
                typeId     = COALESCE($2, cdm.typeId),
                brandId    = COALESCE($3, cdm.brandId),
                holderName = COALESCE($4, cdm.holderName),
                last4      = COALESCE($5, cdm.last4),
                alias      = COALESCE($6, cdm.alias),
                updatedAt  = NOW()
            FROM clients c
            WHERE cdm.id = $7 AND cdm.clientId = c.id AND c.userId = $8 AND cdm.deletedAt IS NULL
            RETURNING cdm.*
        `, [p.bankId ?? null, p.typeId ?? null, p.brandId ?? null, p.holderName ?? null, p.last4 ?? null, p.alias ?? null, id, userId]);

        if (!rows.length) throw notFound("Método de desembolso");
        return rows[0];
    });
};