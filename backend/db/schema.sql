-- TYPES

CREATE TABLE creditTypes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    requiresItem BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE applicationTypes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE transactionTypes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE documentTypes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE assetTypes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    riskModifier INT NOT NULL DEFAULT 500 CHECK (riskModifier BETWEEN 0 AND 1000)
);

CREATE TABLE incomeTypes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    riskModifier INT NOT NULL DEFAULT 500 CHECK (riskModifier BETWEEN 0 AND 1000)
);

CREATE TABLE liabilityTypes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE clientDataSources (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE jobTypes (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    riskModifier INT NOT NULL DEFAULT 500 CHECK (riskModifier BETWEEN 0 AND 1000)
);

CREATE TABLE documentSources (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE contractTypes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    riskModifier INT NOT NULL DEFAULT 500 CHECK (riskModifier BETWEEN 0 AND 1000)
);

CREATE TABLE auditLogTypes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE rateTypes (
    id SERIAL PRIMARY KEY,

    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    monthlyRateAdjustment NUMERIC(8,6) NOT NULL DEFAULT 0,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE creditRateTypes (
    id SERIAL PRIMARY KEY,
    creditTypeId INT NOT NULL REFERENCES creditTypes(id) ON DELETE CASCADE,

    rateTypeId INT NOT NULL REFERENCES rateTypes(id) ON DELETE CASCADE,
    isDefault BOOLEAN NOT NULL DEFAULT false,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (creditTypeId, rateTypeId)
);

CREATE TABLE insuranceTypes (
    id SERIAL PRIMARY KEY,

    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    fixedMonthlyCost NUMERIC(12,2) DEFAULT 0,
    fixedUpfrontCost NUMERIC(12,2) DEFAULT 0,

    -- el nombre del parametro de un credito, solicitud o simulacion
    -- del cual saca el porcentaje.
    percentageFrom TEXT DEFAULT NULL,
    percentageMonthlyCost NUMERIC(8,6) DEFAULT 0,
    percentageUpfrontCost NUMERIC(8,6) DEFAULT 0,

    isActive BOOLEAN NOT NULL DEFAULT true,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),

    CHECK (
        fixedMonthlyCost >= 0
        AND fixedUpfrontCost >= 0
        AND percentageMonthlyCost >= 0
        AND percentageUpfrontCost >= 0
    )
);

CREATE TABLE creditInsuranceTypes (
    id SERIAL PRIMARY KEY,
    creditTypeId INT NOT NULL REFERENCES creditTypes(id) ON DELETE CASCADE,

    insuranceTypeId INT NOT NULL REFERENCES insuranceTypes(id) ON DELETE CASCADE,
    isRequired BOOLEAN NOT NULL DEFAULT false,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE (
        creditTypeId,
        insuranceTypeId
    )
);

-- STATUS

CREATE TABLE applicationStatus (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE creditStatus (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE creditInstallmentStatus (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE riskLevels (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE decisions (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE verificationStates (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

-- USERS

CREATE TABLE userRoles (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    nickname TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    passwordHash TEXT NOT NULL,
    roleId INT NOT NULL REFERENCES userRoles(id) ON DELETE RESTRICT,

    deletedAt TIMESTAMP,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_users_email_active
ON users(email)
WHERE deletedAt IS NULL;

-- CLIENT CORE

CREATE TABLE clientMaritalStatus (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    userId INT UNIQUE REFERENCES users(id) ON DELETE SET NULL,

    nationalId TEXT UNIQUE NOT NULL CHECK (nationalId <> ''),

    birthDate DATE,
    maritalStatusId INT REFERENCES clientMaritalStatus(id) ON DELETE RESTRICT,

    primaryAddressId INT NULL,
    primaryPaymentMethodId INT NULL,
    primaryDisbursementMethodId INT NULL,

    deletedAt TIMESTAMP,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CLIENT DETAILS

CREATE TABLE clientAddresses (
    id SERIAL PRIMARY KEY,
    clientId INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    address TEXT NOT NULL,
    commune TEXT NOT NULL,
    region TEXT NOT NULL,
    sourceId INT REFERENCES clientDataSources(id) ON DELETE RESTRICT,
    documentId INT,

    verificationStateId INT NOT NULL DEFAULT 1 REFERENCES verificationStates(id) ON DELETE RESTRICT,

    deletedAt TIMESTAMP,

    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE clients
ADD CONSTRAINT fk_primary_address
FOREIGN KEY (primaryAddressId) REFERENCES clientAddresses(id)
ON DELETE SET NULL;


CREATE TABLE clientIncome (
    id SERIAL PRIMARY KEY,
    clientId INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    monthlyIncome NUMERIC(12,2),
    incomeTypeId INT REFERENCES incomeTypes(id) ON DELETE RESTRICT,
    isRecurring BOOLEAN NOT NULL DEFAULT false,
    sourceId INT REFERENCES clientDataSources(id) ON DELETE RESTRICT,
    documentId INT,

    verificationStateId INT NOT NULL DEFAULT 1 REFERENCES verificationStates(id) ON DELETE RESTRICT,

    deletedAt TIMESTAMP,

    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE clientEmployment (
    id SERIAL PRIMARY KEY,
    clientId INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    jobTypeId INT REFERENCES jobTypes(id) ON DELETE RESTRICT,
    contractTypeId INT REFERENCES contractTypes(id) ON DELETE RESTRICT,
    salary NUMERIC(12,2),
    startDate DATE,

    sourceId INT REFERENCES clientDataSources(id) ON DELETE RESTRICT,
    documentId INT,

    verificationStateId INT NOT NULL DEFAULT 1 REFERENCES verificationStates(id) ON DELETE RESTRICT,

    deletedAt TIMESTAMP,

    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE clientAssets (
    id SERIAL PRIMARY KEY,
    clientId INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    assetTypeId INT NOT NULL REFERENCES assetTypes(id) ON DELETE RESTRICT,
    value NUMERIC(12,2),
    ownershipPercentage NUMERIC(5,2) DEFAULT 100 CHECK (ownershipPercentage BETWEEN 0 AND 100),

    sourceId INT REFERENCES clientDataSources(id) ON DELETE RESTRICT,
    documentId INT,

    verificationStateId INT NOT NULL DEFAULT 1 REFERENCES verificationStates(id) ON DELETE RESTRICT,

    deletedAt TIMESTAMP,

    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE paymentMethodTypes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE brandTypes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE bankTypes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE clientPaymentMethods (
    id SERIAL PRIMARY KEY,
    clientId INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    provider TEXT NOT NULL,
    providerPaymentMethodId TEXT,

    brandId INT REFERENCES brandTypes(id) ON DELETE RESTRICT,
    bankId INT NOT NULL REFERENCES bankTypes(id) ON DELETE RESTRICT,
    typeId INT REFERENCES paymentMethodTypes(id) ON DELETE RESTRICT,
    holderName TEXT,
    last4 TEXT,
    alias TEXT,

    deletedAt TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idxClientPaymentMethodsClient
ON clientPaymentMethods(clientId);

CREATE TABLE disbursementMethodTypes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE clientDisbursementMethods (
    id SERIAL PRIMARY KEY,
    clientId INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    brandId INT REFERENCES brandTypes(id) ON DELETE RESTRICT,
    bankId INT NOT NULL REFERENCES bankTypes(id) ON DELETE RESTRICT,
    typeId INT REFERENCES disbursementMethodTypes(id) ON DELETE RESTRICT,
    holderName TEXT,
    last4 TEXT,
    alias TEXT,

    deletedAt TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idxClientDisbursementMethodsClient
ON clientDisbursementMethods(clientId);


-- CREDIT ITEMS

CREATE TABLE creditItems (
    id SERIAL PRIMARY KEY,

    creditTypeId INT NOT NULL
    REFERENCES creditTypes(id)
    ON DELETE CASCADE,

    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    riskModifier INT NOT NULL DEFAULT 500 CHECK (riskModifier BETWEEN 0 AND 1000),

    maxLTV NUMERIC(5,2),
    maxTermMonths INT,

    isActive BOOLEAN NOT NULL DEFAULT true,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SIMULATIONS

CREATE TABLE simulations (
    id SERIAL PRIMARY KEY,

    clientId INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    creditTypeId INT NOT NULL REFERENCES creditTypes(id) ON DELETE RESTRICT,

    itemTypeId INT REFERENCES creditItems(id) ON DELETE RESTRICT,
    rateTypeId INT REFERENCES rateTypes(id) ON DELETE RESTRICT,
    paymentMethodId INT REFERENCES clientPaymentMethods(id) ON DELETE SET NULL,
    disbursementMethodId INT REFERENCES clientDisbursementMethods(id) ON DELETE SET NULL,

    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),

    itemValue NUMERIC(12,2),
    downPayment NUMERIC(12,2) DEFAULT 0,

    termMonths INT NOT NULL CHECK (termMonths > 0),

    upfrontCosts NUMERIC(12,2) NOT NULL DEFAULT 0,
    monthlyCosts NUMERIC(12,2) NOT NULL DEFAULT 0,

    monthlyInstallment NUMERIC(12,2),
    monthlyRate NUMERIC(8,6),
    annualRate NUMERIC(8,6),

    apr NUMERIC(8,6) NOT NULL CHECK (apr >= 0),
    tcc NUMERIC(12,2),
    totalPay NUMERIC(12,2),

    firstPaymentDate DATE,

    score INT NOT NULL CHECK (score >= 0),
    riskLevelId INT NOT NULL REFERENCES riskLevels(id) ON DELETE RESTRICT,

    resultSnapshot JSONB,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),

    CHECK (
        (
            itemValue IS NULL
            AND itemTypeId IS NULL
        )
        OR
        (
            itemValue IS NOT NULL
            AND itemTypeId IS NOT NULL
        )
    )
);

CREATE TABLE simulationInsurances (
    id SERIAL PRIMARY KEY,
    simulationId INT NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,

    insuranceTypeId INT NOT NULL REFERENCES insuranceTypes(id) ON DELETE RESTRICT,

    monthlyCost NUMERIC(12,2) NOT NULL DEFAULT 0,
    upfrontCost NUMERIC(12,2) NOT NULL DEFAULT 0,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE (
        simulationId,
        insuranceTypeId
    )
);

-- APPLICATIONS

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,

    clientId INT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    creditTypeId INT NOT NULL REFERENCES creditTypes(id) ON DELETE RESTRICT,

    simulationId INT REFERENCES simulations(id) ON DELETE SET NULL,

    applicationTypeId INT NOT NULL REFERENCES applicationTypes(id) ON DELETE RESTRICT,
    statusId INT NOT NULL REFERENCES applicationStatus(id) ON DELETE RESTRICT,

    itemTypeId INT REFERENCES creditItems(id) ON DELETE RESTRICT,
    rateTypeId INT REFERENCES rateTypes(id) ON DELETE RESTRICT,

    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),

    itemValue NUMERIC(12,2),
    downPayment NUMERIC(12,2) DEFAULT 0,

    termMonths INT NOT NULL CHECK (termMonths > 0),

    upfrontCosts NUMERIC(12,2) NOT NULL DEFAULT 0,
    monthlyCosts NUMERIC(12,2) NOT NULL DEFAULT 0,

    monthlyInstallment NUMERIC(12,2),
    monthlyRate NUMERIC(8,6),
    annualRate NUMERIC(8,6),

    apr NUMERIC(8,6),
    tcc NUMERIC(12,2),
    totalPay NUMERIC(12,2),

    firstPaymentDate DATE,

    deletedAt TIMESTAMP,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),

    CHECK (
        (
            itemValue IS NULL
            AND itemTypeId IS NULL
        )
        OR
        (
            itemValue IS NOT NULL
            AND itemTypeId IS NOT NULL
        )
    )
);

CREATE TABLE applicationInsurances (
    id SERIAL PRIMARY KEY,
    applicationId INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

    insuranceTypeId INT NOT NULL REFERENCES insuranceTypes(id) ON DELETE RESTRICT,

    monthlyCost NUMERIC(12,2) NOT NULL DEFAULT 0,
    upfrontCost NUMERIC(12,2) NOT NULL DEFAULT 0,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE (
        applicationId,
        insuranceTypeId
    )
);

-- DOCUMENTS

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,

    clientId INT REFERENCES clients(id) ON DELETE CASCADE,
    applicationId INT REFERENCES applications(id) ON DELETE CASCADE,

    documentTypeId INT NOT NULL REFERENCES documentTypes(id) ON DELETE RESTRICT,
    sourceId INT NOT NULL REFERENCES clientDataSources(id) ON DELETE RESTRICT,
    documentSourceId INT NOT NULL DEFAULT 1 REFERENCES documentSources(id) ON DELETE RESTRICT,

    url TEXT NOT NULL CHECK (url <> ''),
    metadata JSONB,

    verificationStateId INT NOT NULL DEFAULT 1 REFERENCES verificationStates(id) ON DELETE RESTRICT,
    verifiedBy INT REFERENCES users(id),
    verifiedAt TIMESTAMP,

    deletedAt TIMESTAMP,

    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),

    CHECK (
        (clientId IS NOT NULL AND applicationId IS NULL) OR
        (clientId IS NULL AND applicationId IS NOT NULL)
    )
);

-- SNAPSHOT

CREATE TABLE applicationIncome (
    id SERIAL PRIMARY KEY,
    applicationId INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

    monthlyIncome NUMERIC(12,2),
    incomeTypeId INT REFERENCES incomeTypes(id) ON DELETE RESTRICT,
    isRecurring BOOLEAN NOT NULL DEFAULT false,
    sourceId INT REFERENCES clientDataSources(id) ON DELETE RESTRICT,
    documentId INT,

    verificationStateId INT NOT NULL DEFAULT 1 REFERENCES verificationStates(id) ON DELETE RESTRICT,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE applicationEmployment (
    id SERIAL PRIMARY KEY,
    applicationId INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

    jobTypeId INT REFERENCES jobTypes(id) ON DELETE RESTRICT,
    contractTypeId INT REFERENCES contractTypes(id) ON DELETE RESTRICT,
    salary NUMERIC(12,2),
    startDate DATE,

    sourceId INT REFERENCES clientDataSources(id) ON DELETE RESTRICT,
    documentId INT,

    verificationStateId INT NOT NULL DEFAULT 1 REFERENCES verificationStates(id) ON DELETE RESTRICT,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE applicationAssets (
    id SERIAL PRIMARY KEY,
    applicationId INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

    assetTypeId INT NOT NULL REFERENCES assetTypes(id) ON DELETE RESTRICT,
    value NUMERIC(12,2),
    ownershipPercentage NUMERIC(5,2) DEFAULT 100,

    sourceId INT REFERENCES clientDataSources(id) ON DELETE RESTRICT,
    documentId INT,

    verificationStateId INT NOT NULL DEFAULT 1 REFERENCES verificationStates(id) ON DELETE RESTRICT,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE applicationLiabilities (
    id SERIAL PRIMARY KEY,
    applicationId INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

    liabilityTypeId INT NOT NULL REFERENCES liabilityTypes(id) ON DELETE RESTRICT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    monthlyPayment NUMERIC(12,2),

    verificationStateId INT NOT NULL DEFAULT 1 REFERENCES verificationStates(id) ON DELETE RESTRICT,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- EVALUATION

CREATE TABLE applicationEvaluations (
    id SERIAL PRIMARY KEY,

    applicationId INT UNIQUE NOT NULL
    REFERENCES applications(id)
    ON DELETE CASCADE,

    score INT NOT NULL,

    riskLevelId INT NOT NULL
    REFERENCES riskLevels(id)
    ON DELETE RESTRICT,

    decisionId INT NOT NULL
    REFERENCES decisions(id)
    ON DELETE RESTRICT,

    details JSONB,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CREDITS

CREATE TABLE credits (
    id SERIAL PRIMARY KEY,

    applicationId INT UNIQUE NOT NULL
    REFERENCES applications(id)
    ON DELETE RESTRICT,

    clientId INT NOT NULL
    REFERENCES clients(id)
    ON DELETE RESTRICT,

    creditTypeId INT NOT NULL
    REFERENCES creditTypes(id)
    ON DELETE RESTRICT,

    itemTypeId INT
    REFERENCES creditItems(id)
    ON DELETE RESTRICT,

    rateTypeId INT
    REFERENCES rateTypes(id)
    ON DELETE RESTRICT,
    paymentMethodId INT REFERENCES clientPaymentMethods(id) ON DELETE SET NULL,
    disbursementMethodId INT REFERENCES clientDisbursementMethods(id) ON DELETE SET NULL,

    statusId INT NOT NULL
    REFERENCES creditStatus(id)
    ON DELETE RESTRICT,

    approvedAmount NUMERIC(12,2) NOT NULL
    CHECK (approvedAmount > 0),

    itemValue NUMERIC(12,2),
    downPayment NUMERIC(12,2) DEFAULT 0,

    termMonths INT NOT NULL
    CHECK (termMonths > 0),

    upfrontCosts NUMERIC(12,2) NOT NULL DEFAULT 0,
    monthlyCosts NUMERIC(12,2) NOT NULL DEFAULT 0,

    monthlyInstallment NUMERIC(12,2),
    monthlyRate NUMERIC(8,6),
    annualRate NUMERIC(8,6),

    apr NUMERIC(8,6) NOT NULL
    CHECK (apr >= 0),

    tcc NUMERIC(12,2),
    totalPay NUMERIC(12,2),

    startDate DATE,
    firstPaymentDate DATE,

    deletedAt TIMESTAMP,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),

    CHECK (
        (
            itemValue IS NULL
            AND itemTypeId IS NULL
        )
        OR
        (
            itemValue IS NOT NULL
            AND itemTypeId IS NOT NULL
        )
    )
);

CREATE TABLE creditInsurances (
    id SERIAL PRIMARY KEY,

    creditId INT NOT NULL REFERENCES credits(id) ON DELETE CASCADE,

    insuranceTypeId INT NOT NULL REFERENCES insuranceTypes(id) ON DELETE RESTRICT,

    monthlyCost NUMERIC(12,2) NOT NULL DEFAULT 0,
    upfrontCost NUMERIC(12,2) NOT NULL DEFAULT 0,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE (
        creditId,
        insuranceTypeId
    )
);

-- TRANSACTIONS

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,

    creditId INT NOT NULL
    REFERENCES credits(id)
    ON DELETE CASCADE,

    transactionTypeId INT NOT NULL
    REFERENCES transactionTypes(id)
    ON DELETE RESTRICT,

    amount NUMERIC(12,2) NOT NULL
    CHECK (amount > 0),

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- INSTALLMENTS

CREATE TABLE creditInstallments (
    id SERIAL PRIMARY KEY,

    creditId INT NOT NULL
    REFERENCES credits(id)
    ON DELETE CASCADE,

    statusId INT NOT NULL
    REFERENCES creditInstallmentStatus(id)
    ON DELETE RESTRICT,

    installmentNumber INT NOT NULL,
    dueDate DATE NOT NULL,

    amountDue NUMERIC(12,2) NOT NULL
    CHECK (amountDue > 0),

    paidAt TIMESTAMP,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE (creditId, installmentNumber)
);

-- AUDIT LOGS

CREATE TABLE auditLogs (
    id SERIAL PRIMARY KEY,

    userId INT REFERENCES users(id) ON DELETE SET NULL,

    actionId INT REFERENCES auditLogTypes(id)
    ON DELETE RESTRICT,

    entityType TEXT NOT NULL,
    entityId INT NOT NULL,

    oldValue JSONB,
    newValue JSONB,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- TRANSACTIONS (WIZARD)

CREATE TABLE wizardTransactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clientId INT REFERENCES clients(id) ON DELETE SET NULL,
    wizardType TEXT NOT NULL,
    formData JSONB NOT NULL DEFAULT '{}',
    expiresAt TIMESTAMPTZ NOT NULL,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES

CREATE INDEX idxAuditLogsEntity
ON auditLogs(entityType, entityId);

CREATE INDEX idxApplicationsClient
ON applications(clientId);

CREATE INDEX idxApplicationsSimulation
ON applications(simulationId);

CREATE INDEX idxApplicationsStatus
ON applications(statusId);

CREATE INDEX idxApplicationsStatusClient
ON applications(clientId, statusId);

CREATE INDEX idxCreditsClient
ON credits(clientId);

CREATE INDEX idxCreditsApplication
ON credits(applicationId);

CREATE INDEX idxCreditsStatus
ON credits(statusId);

CREATE INDEX idxCreditsClientStatus
ON credits(clientId, statusId);

CREATE INDEX idxTransactionsCredit
ON transactions(creditId);

CREATE INDEX idxInstallmentsCredit
ON creditInstallments(creditId);

CREATE INDEX idxClientsUser
ON clients(userId);

CREATE INDEX idxDocumentsClient
ON documents(clientId);

CREATE INDEX idxClientAddressesClient
ON clientAddresses(clientId);

CREATE INDEX idxClientIncomeClient
ON clientIncome(clientId);

CREATE INDEX idxClientEmploymentClient
ON clientEmployment(clientId);

CREATE INDEX idxClientAssetsClient
ON clientAssets(clientId);

CREATE INDEX idxClientIncomeDocument
ON clientIncome(documentId);

CREATE INDEX idxClientEmploymentDocument
ON clientEmployment(documentId);

CREATE INDEX idxClientAssetsDocument
ON clientAssets(documentId);

CREATE INDEX idxApplicationIncomeDocument
ON applicationIncome(documentId);

CREATE INDEX idxApplicationEmploymentDocument
ON applicationEmployment(documentId);

CREATE INDEX idxApplicationAssetsDocument
ON applicationAssets(documentId);

CREATE INDEX idxSimulationsClient
ON simulations(clientId);

CREATE INDEX idxDocumentsApplication
ON documents(applicationId);

CREATE INDEX idxInstallmentsDueDate
ON creditInstallments(dueDate);

CREATE INDEX idxCreditItemsCreditType
ON creditItems(creditTypeId);

CREATE INDEX idxSimulationsItemType
ON simulations(itemTypeId);

CREATE INDEX idxApplicationsItemType
ON applications(itemTypeId);

CREATE INDEX idxCreditsItemType
ON credits(itemTypeId);

CREATE INDEX idxCreditInstallmentsStatus
ON creditInstallments(statusId);

CREATE INDEX idxWizardTransactionExpiratesAt
ON wizardTransactions(expiresAt);

CREATE INDEX idxWizardTransactionClient
ON wizardTransactions(clientId);

-- TRIGGERS

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updatedAt = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_clients
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_clientAddresses
BEFORE UPDATE ON clientAddresses
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_clientIncome
BEFORE UPDATE ON clientIncome
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_clientEmployment
BEFORE UPDATE ON clientEmployment
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_clientAssets
BEFORE UPDATE ON clientAssets
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_documents
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_applications
BEFORE UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_credits
BEFORE UPDATE ON credits
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- VALIDACIÓN: si `sourceId` es 'HYBRID' o 'DOCUMENT', entonces `documentId` debe existir (NOT NULL)
CREATE OR REPLACE FUNCTION ensure_document_for_source()
RETURNS TRIGGER AS $$
DECLARE
    src_code TEXT;
BEGIN
    IF NEW.sourceId IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT code INTO src_code FROM clientDataSources WHERE id = NEW.sourceId;
    IF src_code IS NULL THEN
        RAISE EXCEPTION 'clientDataSources id % not found', NEW.sourceId;
    END IF;

    IF src_code IN ('HYBRID', 'DOCUMENT') AND NEW.documentId IS NULL THEN
        RAISE EXCEPTION 'documentId required when sourceId is %', src_code;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clientIncome_check_document BEFORE INSERT OR UPDATE ON clientIncome FOR EACH ROW EXECUTE FUNCTION ensure_document_for_source();
CREATE TRIGGER trg_clientEmployment_check_document BEFORE INSERT OR UPDATE ON clientEmployment FOR EACH ROW EXECUTE FUNCTION ensure_document_for_source();
CREATE TRIGGER trg_clientAssets_check_document BEFORE INSERT OR UPDATE ON clientAssets FOR EACH ROW EXECUTE FUNCTION ensure_document_for_source();
CREATE TRIGGER trg_clientAddresses_check_document BEFORE INSERT OR UPDATE ON clientAddresses FOR EACH ROW EXECUTE FUNCTION ensure_document_for_source();
CREATE TRIGGER trg_applicationIncome_check_document BEFORE INSERT OR UPDATE ON applicationIncome FOR EACH ROW EXECUTE FUNCTION ensure_document_for_source();
CREATE TRIGGER trg_applicationEmployment_check_document BEFORE INSERT OR UPDATE ON applicationEmployment FOR EACH ROW EXECUTE FUNCTION ensure_document_for_source();
CREATE TRIGGER trg_applicationAssets_check_document BEFORE INSERT OR UPDATE ON applicationAssets FOR EACH ROW EXECUTE FUNCTION ensure_document_for_source();

-- CONSTRAINTS

-- TRIGGERS FOR SOFT-DELETE: si un registro hijo se marca como eliminado (soft delete),
-- limpiar (NULL) la referencia correspondiente en la tabla `clients`.
CREATE OR REPLACE FUNCTION set_clients_null_on_child_softdelete()
RETURNS TRIGGER AS $$
DECLARE
    replacement_id INT;
BEGIN
    -- clientAddresses -> clients.primaryAddressId
    IF lower(TG_TABLE_NAME) = 'clientaddresses' THEN
        IF OLD.deletedAt IS NULL AND NEW.deletedAt IS NOT NULL THEN
            SELECT id INTO replacement_id
            FROM clientAddresses
            WHERE clientId = NEW.clientId AND deletedAt IS NULL AND id <> NEW.id
            ORDER BY createdAt ASC, id ASC
            LIMIT 1;

            UPDATE clients
            SET primaryAddressId = replacement_id
            WHERE id = NEW.clientId AND primaryAddressId = NEW.id;
        END IF;
        RETURN NEW;
    END IF;

    -- clientPaymentMethods -> clients.primaryPaymentMethodId
    IF lower(TG_TABLE_NAME) = 'clientpaymentmethods' THEN
        IF OLD.deletedAt IS NULL AND NEW.deletedAt IS NOT NULL THEN
            SELECT id INTO replacement_id
            FROM clientPaymentMethods
            WHERE clientId = NEW.clientId AND deletedAt IS NULL AND id <> NEW.id
            ORDER BY createdAt ASC, id ASC
            LIMIT 1;

            UPDATE clients
            SET primaryPaymentMethodId = replacement_id
            WHERE id = NEW.clientId AND primaryPaymentMethodId = NEW.id;
        END IF;
        RETURN NEW;
    END IF;

    -- clientDisbursementMethods -> clients.primaryDisbursementMethodId
    IF lower(TG_TABLE_NAME) = 'clientdisbursementmethods' THEN
        IF OLD.deletedAt IS NULL AND NEW.deletedAt IS NOT NULL THEN
            SELECT id INTO replacement_id
            FROM clientDisbursementMethods
            WHERE clientId = NEW.clientId AND deletedAt IS NULL AND id <> NEW.id
            ORDER BY createdAt ASC, id ASC
            LIMIT 1;

            UPDATE clients
            SET primaryDisbursementMethodId = replacement_id
            WHERE id = NEW.clientId AND primaryDisbursementMethodId = NEW.id;
        END IF;
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clientAddresses_softdelete
AFTER UPDATE OF deletedAt ON clientAddresses
FOR EACH ROW
WHEN (OLD.deletedAt IS NULL AND NEW.deletedAt IS NOT NULL)
EXECUTE FUNCTION set_clients_null_on_child_softdelete();

CREATE TRIGGER trg_clientPaymentMethods_softdelete
AFTER UPDATE OF deletedAt ON clientPaymentMethods
FOR EACH ROW
WHEN (OLD.deletedAt IS NULL AND NEW.deletedAt IS NOT NULL)
EXECUTE FUNCTION set_clients_null_on_child_softdelete();

CREATE TRIGGER trg_clientDisbursementMethods_softdelete
AFTER UPDATE OF deletedAt ON clientDisbursementMethods
FOR EACH ROW
WHEN (OLD.deletedAt IS NULL AND NEW.deletedAt IS NOT NULL)
EXECUTE FUNCTION set_clients_null_on_child_softdelete();

-- Si se inserta una fila hijo y el cliente tiene NULL en la referencia primaria,
-- asignar esta nueva fila como primaria. No hace nada si ya existe un primario.
CREATE OR REPLACE FUNCTION set_clients_primary_on_child_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF lower(TG_TABLE_NAME) = 'clientaddresses' THEN
        UPDATE clients
        SET primaryAddressId = NEW.id
        WHERE id = NEW.clientId AND primaryAddressId IS NULL;
        RETURN NEW;
    ELSIF lower(TG_TABLE_NAME) = 'clientpaymentmethods' THEN
        UPDATE clients
        SET primaryPaymentMethodId = NEW.id
        WHERE id = NEW.clientId AND primaryPaymentMethodId IS NULL;
        RETURN NEW;
    ELSIF lower(TG_TABLE_NAME) = 'clientdisbursementmethods' THEN
        UPDATE clients
        SET primaryDisbursementMethodId = NEW.id
        WHERE id = NEW.clientId AND primaryDisbursementMethodId IS NULL;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clientAddresses_insert_primary
AFTER INSERT ON clientAddresses
FOR EACH ROW
EXECUTE FUNCTION set_clients_primary_on_child_insert();

CREATE TRIGGER trg_clientPaymentMethods_insert_primary
AFTER INSERT ON clientPaymentMethods
FOR EACH ROW
EXECUTE FUNCTION set_clients_primary_on_child_insert();

CREATE TRIGGER trg_clientDisbursementMethods_insert_primary
AFTER INSERT ON clientDisbursementMethods
FOR EACH ROW
EXECUTE FUNCTION set_clients_primary_on_child_insert();

ALTER TABLE clientIncome
    ADD CONSTRAINT fk_clientIncome_documentId
    FOREIGN KEY (documentId) REFERENCES documents(id)
    ON DELETE SET NULL;

ALTER TABLE clientEmployment
    ADD CONSTRAINT fk_clientEmployment_documentId
    FOREIGN KEY (documentId) REFERENCES documents(id)
    ON DELETE SET NULL;

ALTER TABLE clientAssets
    ADD CONSTRAINT fk_clientAssets_documentId
    FOREIGN KEY (documentId) REFERENCES documents(id)
    ON DELETE SET NULL;

ALTER TABLE clientAddresses
    ADD CONSTRAINT fk_clientAddresses_documentId
    FOREIGN KEY (documentId) REFERENCES documents(id)
    ON DELETE SET NULL;

ALTER TABLE clients
    ADD CONSTRAINT fk_primary_payment_method
    FOREIGN KEY (primaryPaymentMethodId) REFERENCES clientPaymentMethods(id)
    ON DELETE SET NULL;

ALTER TABLE clients
    ADD CONSTRAINT fk_primary_disbursement_method
    FOREIGN KEY (primaryDisbursementMethodId) REFERENCES clientDisbursementMethods(id)
    ON DELETE SET NULL;

ALTER TABLE applicationIncome
    ADD CONSTRAINT fk_applicationIncome_documentId
    FOREIGN KEY (documentId) REFERENCES documents(id)
    ON DELETE SET NULL;

ALTER TABLE applicationEmployment
    ADD CONSTRAINT fk_applicationEmployment_documentId
    FOREIGN KEY (documentId) REFERENCES documents(id)
    ON DELETE SET NULL;

ALTER TABLE applicationAssets
    ADD CONSTRAINT fk_applicationAssets_documentId
    FOREIGN KEY (documentId) REFERENCES documents(id)
    ON DELETE SET NULL;

-- DEFAULT DATA

INSERT INTO userRoles (code, name, description) VALUES
('CLIENT', 'Cliente', 'clientes del sistema'),
('ADMIN', 'Administrador', 'administrador'),
('ANALYST', 'Analista', 'analista de credito');

INSERT INTO clientDataSources (code, name, description) VALUES
('MANUAL', 'Manual', 'ingresado manualmente'),
('HYBRID', 'Hibrido', 'ingresado manualmente, con extraccion desde documento'),
('DOCUMENT', 'Documento', 'extraido desde documento'),
('SYSTEM', 'Sistema', 'generado por el sistema');

INSERT INTO documentSources (code, name, description) VALUES
('CLIENT', 'Cliente', 'Documento ingresado por el cliente'),
('SYSTEM', 'Sistema', 'Documento generado por el sistema');

INSERT INTO riskLevels (code, name) VALUES
('LOW', 'Bajo'),
('MEDIUM', 'Medio'),
('HIGH', 'Alto');

INSERT INTO decisions (code, name) VALUES
('APPROVE', 'Aprobar'),
('REJECT', 'Rechazar'),
('REVIEW', 'Revisión manual');

INSERT INTO clientMaritalStatus (code, name, description) VALUES
('SOLTERO', 'Soltero/a', 'Persona no casada'),
('CASADO', 'Casado/a', 'Persona casada'),
('DIVORCIADO', 'Divorciado/a', 'Persona divorciada'),
('SEPARADO', 'Separado/a', 'Separado sin divorcio legal'),
('VIUDO', 'Viudo/a', 'Persona viuda'),
('CONVIVIENTE', 'Conviviente civil', 'Union civil o convivencia');

INSERT INTO assetTypes (code, name, description, riskModifier) VALUES
('PROPERTY', 'Propiedad', 'Bien inmueble', 200),
('VEHICLE', 'Vehículo', 'Auto o moto', 600),
('SAVINGS', 'Ahorros', 'Dinero en cuentas', 50),
('INVESTMENT', 'Inversión', 'Acciones, fondos', 400),
('OTHER', 'Otro', 'Otro tipo de activo', 800);

INSERT INTO incomeTypes (code, name, description, riskModifier) VALUES
('FREELANCE', 'Freelance', 'Trabajo independiente', 700),
('RENTAL_INCOME', 'Arriendo', 'Ingresos por propiedades', 400),
('INVESTMENTS', 'Inversiones', 'Rendimientos financieros', 400),
('PENSION', 'Pensión', 'Ingresos por jubilación', 100),
('BUSINESS_INCOME', 'Actividad Comercial', 'Ingresos por negocio propio', 600),
('COMMISSIONS', 'Comisiones', 'Ingresos variables por ventas', 700),
('ROYALTIES', 'Royalties', 'Derechos de autor o patentes', 600),
('GOVERNMENT_BENEFIT', 'Beneficio Estatal', 'Subsidios o bonos', 200),
('OTHER', 'Otro', 'Otros ingresos', 800);

INSERT INTO liabilityTypes (code, name, description) VALUES
('CREDIT_CARD', 'Tarjeta de crédito', 'Deuda tarjeta'),
('PERSONAL_LOAN', 'Crédito de consumo', 'Préstamo personal'),
('MORTGAGE', 'Hipoteca', 'Crédito hipotecario'),
('AUTO_LOAN', 'Crédito automotriz', 'Préstamo vehículo'),
('OTHER', 'Otro', 'Otra deuda');

INSERT INTO jobTypes (name, riskModifier) VALUES
('Ingeniero de software', 200),
('Desarrollador', 250),
('Profesor', 150),
('Vendedor', 600),
('Administrador', 300),
('Contador', 200),
('Médico', 100),
('Enfermero', 150),
('Abogado', 200),
('Arquitecto', 300),
('Técnico', 400),
('Operario', 500),
('Independiente', 700),
('Empresario', 600),
('Desempleado', 1000);

INSERT INTO contractTypes (code, name, description, riskModifier) VALUES
('INDEFINIDO', 'Indefinido', 'Contrato de duración indefinida, muy estable', 100),
('HONORARIOS', 'Honorarios', 'Prestación de servicios independientes, menos estable', 800),
('PLAZO_FIJO', 'Plazo Fijo', 'Contrato con fecha de término, riesgo medio', 500);

INSERT INTO documentTypes (code, name, description) VALUES
('ID_CARD', 'Cédula de identidad', 'documento de identidad'),
('INCOME_PROOF', 'Comprobante de ingresos', 'ingresos'),
('BANK_STATEMENT', 'Cartola bancaria', 'movimientos'),
('CONTRACT', 'Contrato de trabajo', 'contrato laboral'),
('PROPERTY_APPRAISAL', 'Tasación de propiedad', 'valor propiedad'),
('PROPERTY_DEED', 'Escritura de propiedad', 'documento legal'),
('MORTGAGE_INSURANCE', 'Seguro hipotecario', 'seguro'),
('FIRE_INSURANCE', 'Seguro contra incendios', 'seguro'),
('PROPERTY_REGISTRY', 'Certificado del conservador', 'registro'),
('ADDRESS_PROOF', 'Comprobante de domicilio', 'direccion'),
('BANK_ACCOUNT_PROOF', 'Certificado cuenta bancaria', 'cuenta');

-- VERIFICATION STATES

INSERT INTO verificationStates (code, name, description) VALUES
('PENDING', 'Pendiente', 'En espera de verificación'),
('VERIFIED', 'Verificado', 'Verificado satisfactoriamente'),
('REJECTED', 'Rechazado', 'Verificación rechazada');

-- PAYMENT / DISBURSEMENT METHOD TYPES

INSERT INTO paymentMethodTypes (code, name, description) VALUES
('CREDIT_CARD', 'Tarjeta de crédito', 'Tarjeta de crédito'),
('DEBIT_CARD', 'Tarjeta de débito', 'Tarjeta de débito'),
('BANK_ACCOUNT', 'Cuenta bancaria', 'Cuenta bancaria');

INSERT INTO disbursementMethodTypes (code, name, description) VALUES
('BANK_ACCOUNT', 'Cuenta bancaria', 'Desembolso a cuenta bancaria'),
('CHECK', 'Cheque', 'Desembolso por cheque');

INSERT INTO brandTypes (code, name, description) VALUES
('VISA', 'Visa', 'Visa'),
('MASTERCARD', 'Mastercard', 'Mastercard');

INSERT INTO bankTypes (code, name, description) VALUES
('BANCO_ESTADO', 'Banco Estado', 'Banco Estado'),
('BANCO_DE_CHILE', 'Banco de Chile', 'Banco de Chile'),
('BCI', 'BCI', 'Banco BCI');

INSERT INTO creditTypes (
    code,
    name,
    description,
    requiresItem
) VALUES
(
    'CONSUMPTION',
    'Crédito de consumo',
    'credito consumo',
    false
),
(
    'MORTGAGE',
    'Crédito hipotecario',
    'credito hipotecario',
    true
);

INSERT INTO applicationTypes (code, name) VALUES
('NORMAL', 'Normal'),
('PREAPPROVED', 'Preaprobado'),
('PROMOTION', 'Promoción');

INSERT INTO transactionTypes (code, name) VALUES
('PAYMENT', 'Pago'),
('DISBURSEMENT', 'Desembolso');

INSERT INTO applicationStatus (code, name) VALUES
('PENDING', 'Pendiente'),
('APPROVED', 'Aprobado'),
('REJECTED', 'Rechazado');

INSERT INTO creditStatus (code, name) VALUES
('ACTIVE', 'Activo'),
('PAID', 'Pagado'),
('DEFAULTED', 'En mora'),
('CANCELLED', 'Cancelado');

INSERT INTO creditInstallmentStatus (code, name) VALUES
('PENDING', 'Pendiente'),
('PAID', 'Pagado'),
('LATE', 'Atrasado');

INSERT INTO auditLogTypes (code, name, description) VALUES
('CREATE', 'Crear', 'creacion'),
('UPDATE', 'Actualizar', 'actualizacion'),
('DELETE', 'Eliminar', 'eliminacion');

-- RATE TYPES

INSERT INTO rateTypes (
    code,
    name,
    description,
    monthlyRateAdjustment
) VALUES
(
    'FIXED',
    'Fija',
    'tasa fija',
    0.000000
),
(
    'VARIABLE',
    'Variable',
    'tasa variable',
    -0.001000
),
(
    'MIXED',
    'Mixta',
    'tasa mixta',
    0.000500
);

-- CONSUMO -> fija (siempre)

INSERT INTO creditRateTypes (
    creditTypeId,
    rateTypeId,
    isDefault
)
SELECT
    ct.id,
    rt.id,
    true
FROM creditTypes ct
CROSS JOIN rateTypes rt
WHERE ct.code = 'CONSUMPTION'
AND rt.code = 'FIXED';

-- HIPOTECARIO -> fija

INSERT INTO creditRateTypes (
    creditTypeId,
    rateTypeId,
    isDefault
)
SELECT
    ct.id,
    rt.id,
    true
FROM creditTypes ct
CROSS JOIN rateTypes rt
WHERE ct.code = 'MORTGAGE'
AND rt.code = 'FIXED';

-- HIPOTECARIO -> variable

INSERT INTO creditRateTypes (
    creditTypeId,
    rateTypeId,
    isDefault
)
SELECT
    ct.id,
    rt.id,
    false
FROM creditTypes ct
CROSS JOIN rateTypes rt
WHERE ct.code = 'MORTGAGE'
AND rt.code = 'VARIABLE';

-- HIPOTECARIO -> mixta

INSERT INTO creditRateTypes (
    creditTypeId,
    rateTypeId,
    isDefault
)
SELECT
    ct.id,
    rt.id,
    false
FROM creditTypes ct
CROSS JOIN rateTypes rt
WHERE ct.code = 'MORTGAGE'
AND rt.code = 'MIXED';

-- CREDIT ITEMS

INSERT INTO creditItems (
    creditTypeId,
    code,
    name,
    description,
    riskModifier,
    maxLTV,
    maxTermMonths
)
SELECT
    ct.id,
    'HOUSE',
    'Casa',
    'propiedad tipo casa',
    300,
    90.00,
    360
FROM creditTypes ct
WHERE ct.code = 'MORTGAGE';

INSERT INTO creditItems (
    creditTypeId,
    code,
    name,
    description,
    riskModifier,
    maxLTV,
    maxTermMonths
)
SELECT
    ct.id,
    'APARTMENT',
    'Departamento',
    'propiedad tipo departamento',
    400,
    85.00,
    360
FROM creditTypes ct
WHERE ct.code = 'MORTGAGE';

INSERT INTO insuranceTypes (
    code,
    name,
    description,

    fixedMonthlyCost,
    fixedUpfrontCost,

    percentageFrom,
    percentageMonthlyCost,
    percentageUpfrontCost
) VALUES

-- CONSUMO

(
    'DESGRAVAMEN',
    'Seguro de desgravamen',
    'cubre fallecimiento e invalidez total permanente',

    0,
    0,

    'amount',
    0.000300,
    0
),

(
    'UNEMPLOYMENT',
    'Seguro de cesantía',
    'cubre cuotas en caso de desempleo',

    0,
    0,

    'monthlyInstallment',
    0.005000,
    0
),

(
    'ACCIDENT',
    'Seguro de accidentes personales',
    'cobertura por accidentes personales',

    4500,
    0,

    NULL,
    0,
    0
),

-- HIPOTECARIO

(
    'FIRE',
    'Seguro contra incendios',
    'cobertura contra incendios de la propiedad',

    0,
    0,

    'itemValue',
    0.000120,
    0
),

(
    'EARTHQUAKE',
    'Seguro de sismo',
    'cobertura por daños sísmicos',

    0,
    0,

    'itemValue',
    0.000180,
    0
),

(
    'MORTGAGE_LIFE',
    'Seguro de vida hipotecario',
    'seguro de desgravamen para crédito hipotecario',

    0,
    0,

    'amount',
    0.000250,
    0
);

-- CREDIT INSURANCE TYPES

-- CONSUMO -> DESGRAVAMEN (obligatorio)

INSERT INTO creditInsuranceTypes (
    creditTypeId,
    insuranceTypeId,
    isRequired
)
SELECT
    ct.id,
    it.id,
    true
FROM creditTypes ct
CROSS JOIN insuranceTypes it
WHERE ct.code = 'CONSUMPTION'
AND it.code = 'DESGRAVAMEN';

-- CONSUMO -> CESANTIA (opcional)

INSERT INTO creditInsuranceTypes (
    creditTypeId,
    insuranceTypeId,
    isRequired
)
SELECT
    ct.id,
    it.id,
    false
FROM creditTypes ct
CROSS JOIN insuranceTypes it
WHERE ct.code = 'CONSUMPTION'
AND it.code = 'UNEMPLOYMENT';

-- CONSUMO -> ACCIDENTES (opcional)

INSERT INTO creditInsuranceTypes (
    creditTypeId,
    insuranceTypeId,
    isRequired
)
SELECT
    ct.id,
    it.id,
    false
FROM creditTypes ct
CROSS JOIN insuranceTypes it
WHERE ct.code = 'CONSUMPTION'
AND it.code = 'ACCIDENT';

-- HIPOTECARIO

-- HIPOTECARIO -> VIDA/DESGRAVAMEN (obligatorio)

INSERT INTO creditInsuranceTypes (
    creditTypeId,
    insuranceTypeId,
    isRequired
)
SELECT
    ct.id,
    it.id,
    true
FROM creditTypes ct
CROSS JOIN insuranceTypes it
WHERE ct.code = 'MORTGAGE'
AND it.code = 'MORTGAGE_LIFE';

-- HIPOTECARIO -> INCENDIO (obligatorio)

INSERT INTO creditInsuranceTypes (
    creditTypeId,
    insuranceTypeId,
    isRequired
)
SELECT
    ct.id,
    it.id,
    true
FROM creditTypes ct
CROSS JOIN insuranceTypes it
WHERE ct.code = 'MORTGAGE'
AND it.code = 'FIRE';

-- HIPOTECARIO -> SISMO (obligatorio)

INSERT INTO creditInsuranceTypes (
    creditTypeId,
    insuranceTypeId,
    isRequired
)
SELECT
    ct.id,
    it.id,
    true
FROM creditTypes ct
CROSS JOIN insuranceTypes it
WHERE ct.code = 'MORTGAGE'
AND it.code = 'EARTHQUAKE';

