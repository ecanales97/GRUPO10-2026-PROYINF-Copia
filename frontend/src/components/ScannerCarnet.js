import React, { useState } from "react";

const MODOS_CONFIG = {
    carnet: {
        titulo: "Cédula de Identidad",
        icono: "🪪",
        campos: [
            { label: "RUT", key: "run", icon: "🆔" },
            { label: "Nombres", key: "nombres", icon: "👤" },
            { label: "Apellidos", key: "apellidos", icon: "🧬" },
            { label: "N° Serie", key: "serie", icon: "📜" },
            { label: "Vencimiento", key: "vencimiento", icon: "🗓️" },
            { label: "Nacionalidad", key: "nacionalidad", icon: "🗺️" }
        ]
    },
    liquidaciones: {
        titulo: "Liquidaciones de Sueldo",
        icono: "💰",
        campos: [
            { label: "Empresa", key: "empresa", icon: "🏢" },
            { label: "Periodo", key: "mes", icon: "📅" },
            { label: "Sueldo Líquido", key: "liquido", icon: "💵" },
            { label: "Total Haberes", key: "haberes", icon: "📈" },
            { label: "RUT", key: "rut", icon: "🆔" },
            { label: "Nombre", key: "nombre", icon: "👤" }
        ]
    },
    afp: {
        titulo: "Certificado AFP",
        icono: "🏦",
        campos: [
            { label: "AFP", key: "afp", icon: "🏛️" },
            { label: "Meses", key: "meses_cotizados", icon: "📊" },
            { label: "Renta Imponible", key: "renta_imponible", icon: "💎" },
            { label: "RUT", key: "rut", icon: "🆔" },
            { label: "Nombre", key: "nombre", icon: "👤" }
        ]
    },
    domicilio: {
        titulo: "Comprobante Domicilio",
        icono: "🏠",
        campos: [
            { label: "Titular", key: "titular", icon: "👤" },
            { label: "Dirección", key: "direccion", icon: "📍" },
            { label: "Comuna", key: "comuna", icon: "🗺️" }
        ]
    }
};

const ScannerIA = () => {
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modo, setModo] = useState("carnet");

    const styles = `
        .tabs-container { display: flex; overflow-x: auto; gap: 10px; margin-bottom: 25px; padding-bottom: 10px; }
        .tab-btn { 
            white-space: nowrap; padding: 10px 18px; border-radius: 12px; border: 1px solid #287f87; 
            background: transparent; color: #287f87; cursor: pointer; transition: 0.3s;
        }
        .tab-btn.active { background: #c6de8f; color: #040501; border-color: #c6de8f; font-weight: bold; }
        .upload-box { border: 2px dashed #287f87; padding: 30px; border-radius: 20px; text-align: center; margin-bottom: 30px; }
        .dark-card { background: #0d0e0a; padding: 25px; border-radius: 15px; border: 1px solid #287f87; max-width: 600px; margin: 0 auto; }
        .dato-row { margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; }
        .dato-label { color: #c6de8f; font-size: 0.7rem; text-transform: uppercase; display: block; }
        .dato-value { color: #eef5dc; font-size: 1rem; font-family: monospace; }
        .reloj { animation: spin 2s linear infinite; display: inline-block; }
        @keyframes spin { from {transform: rotate(0deg)} to {transform: rotate(360deg)} }
    `;

    const procesarConIA = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setDatos(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(
                `http://localhost:5000/api/document/${modo}`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await res.json();
            setDatos(data);

        } catch (err) {
            console.error("Error procesando documento:", err);
            alert("Error al analizar el documento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-4">
            <style>{styles}</style>

            <h2 style={{ textAlign: "center", color: "#c6de8f", marginBottom: "30px", marginTop: "30px" }}>
                📄 Validador de Documentos
            </h2>

            <div className="tabs-container">
                {Object.keys(MODOS_CONFIG).map((key) => (
                    <button
                        key={key}
                        className={`tab-btn ${modo === key ? "active" : ""}`}
                        onClick={() => { setModo(key); setDatos(null); }}
                    >
                        {MODOS_CONFIG[key].icono} {MODOS_CONFIG[key].titulo}
                    </button>
                ))}
            </div>

            <div className="upload-box">
                {loading ? (
                    <div>
                        <span className="reloj">⏳</span>
                        <p>Analizando {MODOS_CONFIG[modo].titulo}...</p>
                    </div>
                ) : (
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={procesarConIA}
                    />
                )}
            </div>

            {datos && (
                <div className="dark-card">
                    <h4 style={{ color: "#c6de8f", marginTop: 0 }}>
                        Resultados Extraídos
                    </h4>

                    {MODOS_CONFIG[modo].campos.map((campo, i) => (
                        <div className="dato-row" key={i}>
                            <span className="dato-label">
                                {campo.icon} {campo.label}
                            </span>
                            <span className="dato-value">
                                {datos[campo.key] || "No detectado"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ScannerIA;