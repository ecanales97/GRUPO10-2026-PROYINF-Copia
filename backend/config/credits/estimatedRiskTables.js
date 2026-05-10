// EL AJUSTE DEBE SER PARA LA TNM BASE !!!!!
// ESTO ES SOLO PARA ESTIMACION (SIMULACION)
// a no ser :v

const ESTIMATED_RISK_TABLES = {};

ESTIMATED_RISK_TABLES["consumption"] = [
    { maxRatio: 0.07, adjustment: 0.0000 },         // buenisimo
    { maxRatio: 0.10, adjustment: 0.0015 },
    { maxRatio: 0.15, adjustment: 0.0030 },
    { maxRatio: 0.20, adjustment: 0.0060 },
    { maxRatio: 0.25, adjustment: 0.0100 },
    { maxRatio: 0.30, adjustment: 0.0150 },
    { maxRatio: 0.40, adjustment: 0.0200 },
    { maxRatio: 0.50, adjustment: 0.0300 },
    { maxRatio: Infinity, adjustment: 0.0400 },     // malardo
];

ESTIMATED_RISK_TABLES["mortgage"] = [
    { maxRatio: 0.07, adjustment: 0.0000 },         // buenisimo
    { maxRatio: 0.10, adjustment: 0.0010 },
    { maxRatio: 0.15, adjustment: 0.0020 },
    { maxRatio: 0.20, adjustment: 0.0040 },
    { maxRatio: 0.25, adjustment: 0.0070 },
    { maxRatio: 0.30, adjustment: 0.0100 },
    { maxRatio: 0.40, adjustment: 0.0150 },
    { maxRatio: 0.50, adjustment: 0.0200 },
    { maxRatio: Infinity, adjustment: 0.0250 },     // malardo
];

// por si estan desordenadas
Object.keys(ESTIMATED_RISK_TABLES).forEach(type => ESTIMATED_RISK_TABLES[type].sort((a,b) => a.maxRatio - b.maxRatio));

export default ESTIMATED_RISK_TABLES;