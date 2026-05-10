-- CREATE TABLE cliente (
--     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
--     rut varchar(12) unique not null,
--     nombres VARCHAR(50) not null,
--     apellidos VARCHAR(50) not null,
--     fecha_nacimiento date not null,
--     telefono char(15) not null,
--     email varchar(100) not null,
--     direccion TEXT not null,
--     created_at TIMESTAMPTZ DEFAULT now(),
--     updated_at TIMESTAMPTZ DEFAULT now()
-- );

-- CREATE TABLE usuario (
--     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
--     cliente_id BIGINT REFERENCES cliente(id) ON DELETE CASCADE,
--     username varchar(50) unique not null,
--     password char(64) not null,
--     estado BOOLEAN DEFAULT true,
--     ultimo_login TIMESTAMPTZ

-- );

-- CREATE TABLE contrato(
--     id BIGINT PRIMARY KEY,
--     cliente_id BIGINT REFERENCES cliente(id) ON UPDATE CASCADE,
--     n_contrato char(20) unique not null,
--     fecha_firma DATE NOT NULL,
--     estado char(20) NOT NULL,
--     monto NUMERIC(14,2) NOT NULL,
--     tasa_interes NUMERIC(6,3) NOT NULL,
--     plazo_meses INT NOT NULL,
--     fecha_inicio DATE,
--     fecha_termino DATE,
--     created_at TIMESTAMPTZ DEFAULT now()
-- );

-- CREATE TABLE prestamo (
--     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
--     contrato_id BIGINT REFERENCES contrato(id) ON UPDATE CASCADE,
--     nombre char(100) not null,
--     categoria TEXT not null,
--     descripcion TEXT,
--     min_monto NUMERIC(14,2) NOT NULL,
--     max_monto NUMERIC(14,2) NOT NULL,
--     plazo_meses INT NOT NULL,
--     tasa_base NUMERIC(6,3) NOT NULL
-- );

-- CREATE TABLE pago (
--     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
--     prestamo_id BIGINT REFERENCES prestamo(id) ON UPDATE CASCADE,
--     fecha_pago DATE NOT NULL,
--     monto NUMERIC(14,2) NOT NULL,
--     estado TEXT,
--     medio_pago TEXT
-- );

-- CREATE TABLE simulacion (
--     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
--     cliente_id BIGINT REFERENCES cliente(id) ON DELETE CASCADE,
--     monto NUMERIC(14,2) NOT NULL,
--     plazo INTEGER NOT NULL,
--     cuota_mensual INTEGER NOT NULL,
--     cae NUMERIC(5,2) NOT NULL,
--     fecha_simulacion TIMESTAMPTZ DEFAULT now()
-- );

-- TYPES

CREATE TABLE creditTypes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
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
    description TEXT
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
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE auditLogTypes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT
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
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    roleId INT NOT NULL REFERENCES userRoles(id) ON DELETE RESTRICT,

    deletedAt TIMESTAMP,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

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

    nationalId TEXT NOT NULL,

    birthDate DATE,
    maritalStatusId INT REFERENCES clientMaritalStatus(id) ON DELETE RESTRICT,

    primaryAddress INT,

    deletedAt TIMESTAMP,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
);

-- CLIENT DETAILS

CREATE TABLE clientAddresses (
    id SERIAL PRIMARY KEY,
    clientId INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT,

    deletedAt TIMESTAMP,

    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE clients
ADD CONSTRAINT fk_primary_address
FOREIGN KEY (primaryAddress) REFERENCES clientAddresses(id)
ON DELETE SET NULL;

-- ingresos a parte del sueldo
CREATE TABLE clientIncome (
    id SERIAL PRIMARY KEY,
    clientId INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    monthlyIncome NUMERIC(12,2),
    sourceId INT REFERENCES clientDataSources(id) ON DELETE RESTRICT,

    isVerified BOOLEAN NOT NULL DEFAULT false,

    deletedAt TIMESTAMP,

    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- sueldo
CREATE TABLE clientEmployment (
    id SERIAL PRIMARY KEY,
    clientId INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    jobTypeId INT REFERENCES jobTypes(id) ON DELETE RESTRICT,
    salary NUMERIC(12,2),
    startDate DATE,

    sourceId INT REFERENCES clientDataSources(id) ON DELETE RESTRICT,

    isVerified BOOLEAN NOT NULL DEFAULT false,

    deletedAt TIMESTAMP,

    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE clientAssets (
    id SERIAL PRIMARY KEY,
    clientId INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    type INT NOT NULL REFERENCES assetTypes(id) ON DELETE RESTRICT,
    value NUMERIC(12,2),

    sourceId INT REFERENCES clientDataSources(id) ON DELETE RESTRICT,

    isVerified BOOLEAN NOT NULL DEFAULT false,

    deletedAt TIMESTAMP,

    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE clientLiabilities (
    id SERIAL PRIMARY KEY,
    clientId INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    type INT NOT NULL REFERENCES liabilityTypes(id) ON DELETE RESTRICT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    monthlyPayment NUMERIC(12,2) CHECK (monthlyPayment > 0),

    isVerified BOOLEAN NOT NULL DEFAULT false,

    deletedAt TIMESTAMP,

    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SIMULATIONS

CREATE TABLE simulations (
    id SERIAL PRIMARY KEY,
    clientId INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    creditTypeId INT NOT NULL REFERENCES creditTypes(id) ON DELETE RESTRICT,

    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    termMonths INT NOT NULL CHECK (termMonths > 0),
    apr NUMERIC(6,3) NOT NULL CHECK (apr >= 0),

    score INT NOT NULL,
    riskLevelId INT NOT NULL REFERENCES riskLevels(id) ON DELETE RESTRICT,

    resultSnapshot JSONB,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- APPLICATIONS

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,

    clientId INT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    creditTypeId INT NOT NULL REFERENCES creditTypes(id) ON DELETE RESTRICT,

    simulationId INT,
    applicationTypeId INT NOT NULL REFERENCES applicationTypes(id) ON DELETE RESTRICT,
    statusId INT NOT NULL REFERENCES applicationStatus(id) ON DELETE RESTRICT,

    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    termMonths INT NOT NULL CHECK (termMonths > 0),

    deletedAt TIMESTAMP,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE applications
ADD CONSTRAINT fkSimulation
FOREIGN KEY (simulationId) REFERENCES simulations(id)
ON DELETE SET NULL;

-- DOCUMENTS

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,

    clientId INT REFERENCES clients(id) ON DELETE CASCADE,
    applicationId INT REFERENCES applications(id) ON DELETE CASCADE,

    documentTypeId INT NOT NULL REFERENCES documentTypes(id) ON DELETE RESTRICT,
    sourceId INT NOT NULL REFERENCES clientDataSources(id) ON DELETE RESTRICT,

    fileUrl TEXT NOT NULL,
    metadata JSONB,

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
    sourceId INT REFERENCES clientDataSources(id) ON DELETE RESTRICT,
    
    isVerified BOOLEAN NOT NULL DEFAULT false,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE applicationEmployment (
    id SERIAL PRIMARY KEY,
    applicationId INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

    jobTypeId INT REFERENCES jobTypes(id) ON DELETE RESTRICT,
    salary NUMERIC(12,2),
    startDate DATE,

    sourceId INT REFERENCES clientDataSources(id) ON DELETE RESTRICT,
    
    isVerified BOOLEAN NOT NULL DEFAULT false,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE applicationAssets (
    id SERIAL PRIMARY KEY,
    applicationId INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

    type INT NOT NULL REFERENCES assetTypes(id) ON DELETE RESTRICT,
    value NUMERIC(12,2),

    sourceId INT REFERENCES clientDataSources(id) ON DELETE RESTRICT,

    isVerified BOOLEAN NOT NULL DEFAULT false,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE applicationLiabilities (
    id SERIAL PRIMARY KEY,
    applicationId INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

    type INT NOT NULL REFERENCES liabilityTypes(id) ON DELETE RESTRICT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    monthlyPayment NUMERIC(12,2),

    isVerified BOOLEAN NOT NULL DEFAULT false,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- EVALUATION

CREATE TABLE applicationEvaluations (
    id SERIAL PRIMARY KEY,
    applicationId INT UNIQUE NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

    score INT NOT NULL,
    riskLevelId INT NOT NULL REFERENCES riskLevels(id) ON DELETE RESTRICT,
    decisionId INT NOT NULL REFERENCES decisions(id) ON DELETE RESTRICT,

    details JSONB,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CREDITS

CREATE TABLE credits (
    id SERIAL PRIMARY KEY,

    applicationId INT UNIQUE NOT NULL REFERENCES applications(id) ON DELETE RESTRICT,
    clientId INT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    creditTypeId INT NOT NULL REFERENCES creditTypes(id) ON DELETE RESTRICT,

    statusId INT NOT NULL REFERENCES creditStatus(id) ON DELETE RESTRICT,

    approvedAmount NUMERIC(12,2) NOT NULL CHECK (approvedAmount > 0),
    termMonths INT NOT NULL CHECK (termMonths > 0),
    apr NUMERIC(6,3) NOT NULL CHECK (apr >= 0),

    startDate DATE,

    deletedAt TIMESTAMP,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- TRANSACTIONS

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,

    creditId INT NOT NULL REFERENCES credits(id) ON DELETE CASCADE,
    transactionTypeId INT NOT NULL REFERENCES transactionTypes(id) ON DELETE RESTRICT,

    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- INSTALLMENTS

CREATE TABLE creditInstallments (
    id SERIAL PRIMARY KEY,

    creditId INT NOT NULL REFERENCES credits(id) ON DELETE CASCADE,
    statusId INT NOT NULL REFERENCES creditInstallmentStatus(id) ON DELETE RESTRICT,

    installmentNumber INT NOT NULL,
    dueDate DATE NOT NULL,

    amountDue NUMERIC(12,2) NOT NULL CHECK (amountDue > 0),
    paidAt TIMESTAMP,
    
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE (creditId, installmentNumber)
);

-- AUDIT LOGS

CREATE TABLE auditLogs (
    id SERIAL PRIMARY KEY,

    userId INT REFERENCES users(id) ON DELETE SET NULL,
    actionId INT REFERENCES auditLogTypes(id) ON DELETE RESTRICT,

    entityType TEXT NOT NULL,
    entityId INT NOT NULL,

    oldValue JSONB,
    newValue JSONB,

    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- INDEXES

CREATE INDEX idxAuditLogsEntity 
ON auditLogs(entityType, entityId);

CREATE INDEX idxApplicationsClient ON applications(clientId);
CREATE INDEX idxApplicationsSimulation ON applications(simulationId);
CREATE INDEX idxApplicationsStatus ON applications(statusId);
CREATE INDEX idxApplicationsStatusClient
ON applications(clientId, statusId);

CREATE INDEX idxCreditsClient ON credits(clientId);
CREATE INDEX idxCreditsApplication ON credits(applicationId);
CREATE INDEX idxCreditsStatus ON credits(statusId);
CREATE INDEX idxCreditsClientStatus
ON credits(clientId, statusId);

CREATE INDEX idxTransactionsCredit ON transactions(creditId);
CREATE INDEX idxInstallmentsCredit ON creditInstallments(creditId);

CREATE INDEX idxClientsUser ON clients(userId);

CREATE INDEX idxDocumentsClient ON documents(clientId);

CREATE INDEX idxClientAddressesClient ON clientAddresses(clientId);
CREATE INDEX idxClientIncomeClient ON clientIncome(clientId);
CREATE INDEX idxClientEmploymentClient ON clientEmployment(clientId);
CREATE INDEX idxClientAssetsClient ON clientAssets(clientId);
CREATE INDEX idxClientLiabilitiesClient ON clientLiabilities(clientId);

-- TRIGGERS

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updatedAt = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CONFIG TRIGGERS

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

CREATE TRIGGER set_updated_at_clientLiabilities
BEFORE UPDATE ON clientLiabilities
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

-- DEFAULT DATA

INSERT INTO userRoles (code, name, description) VALUES
('CLIENT', 'Cliente', 'clientes del sistema'),
('ADMIN', 'Administrador', 'administrador'),
('ANALYST', 'Analista', 'analista de credito');

INSERT INTO clientDataSources (code, name, description) VALUES
('MANUAL', 'Manual', 'ingresado manualmente'),
('DOCUMENT', 'Documento', 'extraido desde documento'),
('SYSTEM', 'Sistema', 'generado por el sistema');

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

INSERT INTO assetTypes (code, name, description) VALUES
('PROPERTY', 'Propiedad', 'Bien inmueble'),
('VEHICLE', 'Vehículo', 'Auto o moto'),
('SAVINGS', 'Ahorros', 'Dinero en cuentas'),
('INVESTMENT', 'Inversión', 'Acciones, fondos'),
('OTHER', 'Otro', 'Otro tipo de activo');

INSERT INTO liabilityTypes (code, name, description) VALUES
('CREDIT_CARD', 'Tarjeta de crédito', 'Deuda tarjeta'),
('PERSONAL_LOAN', 'Crédito de consumo', 'Préstamo personal'),
('MORTGAGE', 'Hipoteca', 'Crédito hipotecario'),
('AUTO_LOAN', 'Crédito automotriz', 'Préstamo vehículo'),
('OTHER', 'Otro', 'Otra deuda');

-- lo ideal seria meterlos con un csv o algo, pero por ahora para probar xd
INSERT INTO jobTypes (name) VALUES
('Ingeniero de software'),
('Desarrollador'),
('Profesor'),
('Vendedor'),
('Administrador'),
('Contador'),
('Médico'),
('Enfermero'),
('Abogado'),
('Arquitecto'),
('Técnico'),
('Operario'),
('Independiente'),
('Empresario'),
('Desempleado');

INSERT INTO documentTypes (code, name, description) VALUES
('ID_CARD', 'Cédula de identidad', 'documento de identidad'),
('INCOME_PROOF', 'Comprobante de ingresos', 'liquidaciones'),
('BANK_STATEMENT', 'Cartola bancaria', 'movimientos'),
('CONTRACT', 'Contrato de trabajo', 'contrato laboral'),
('PROPERTY_APPRAISAL', 'Tasación de propiedad', 'valor propiedad'),
('PROPERTY_DEED', 'Escritura de propiedad', 'documento legal'),
('MORTGAGE_INSURANCE', 'Seguro hipotecario', 'seguro'),
('FIRE_INSURANCE', 'Seguro contra incendios', 'seguro'),
('PROPERTY_REGISTRY', 'Certificado del conservador', 'registro'),
('ADDRESS_PROOF', 'Comprobante de domicilio', 'direccion'),
('BANK_ACCOUNT_PROOF', 'Certificado cuenta bancaria', 'cuenta');

INSERT INTO creditTypes (code, name, description) VALUES
('CONSUMPTION', 'Crédito de consumo', 'credito consumo'),
('MORTGAGE', 'Crédito hipotecario', 'credito hipotecario');

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