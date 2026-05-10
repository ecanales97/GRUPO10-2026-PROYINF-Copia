import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

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

const ScannerIA = () => {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modo, setModo] = useState("carnet");

  // ?
  const styles = `
    .container { color: #eef5dc; min-height: 100vh; padding: 40px 20px; font-family: system-ui; }
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

  const fileToGenerativePart = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({ inlineData: { data: reader.result.split(",")[1], mimeType: file.type } });
      reader.readAsDataURL(file);
    });
  };
const procesarConIA = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setDatos(null);

    try {
      // 1. CAMBIO DE MODELO A 3.1 FLASH-LITE
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3.1-flash-lite" 
      });

      const imagePart = await fileToGenerativePart(file);
      const config = MODOS_CONFIG[modo];

      // 2. CONFIGURACIÓN DE GENERACIÓN PARA JSON PURO (Evita errores de formato)
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [
          { text: config.prompt }, 
          imagePart
        ]}],
        generationConfig: {
          responseMimeType: "application/json", // Fuerza la salida a JSON
        }
      });

      const response = await result.response;
      const text = response.text();
      
      
      setDatos(JSON.parse(text));

    } catch (err) {
      console.error("Error procesando con Gemini 3.1 Flash-Lite:", err);
      alert("Error al analizar el documento. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <style>{styles}</style>
      
      <h2 style={{ textAlign: "center", color: "#c6de8f", marginBottom: "30px" }}>📄 Validador de Documentos</h2>

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
          <div><span className="reloj">⏳</span> <p>Analizando {MODOS_CONFIG[modo].titulo}...</p></div>
        ) : (
          <input type="file" accept="image/*,application/pdf" onChange={procesarConIA} />
        )}
      </div>

      {datos && (
        <div className="dark-card">
          <h4 style={{ color: "#c6de8f", marginTop: 0 }}>Resultados Extraídos</h4>
          {MODOS_CONFIG[modo].campos.map((campo, i) => (
            <div className="dato-row" key={i}>
              <span className="dato-label">{campo.icon} {campo.label}</span>
              <span className="dato-value">{datos[campo.key] || "No detectado"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScannerIA;