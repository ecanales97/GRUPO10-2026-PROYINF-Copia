import { useEffect, useState } from "react";
import { useAuth } from "context/authContext";
import FillContainer from "components/containers/FillContainer";
import { parseMoneyStringMoney } from "utils/parsers";

const Historial = () => {
    const { user } = useAuth();
    const [historial, setHistorial] = useState([]);
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/simulacion/historial`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const data = await res.json();
                if (res.ok) setHistorial(data);
            } catch (error) {
                console.error(error);
            }
        };
        if (user) fetchHistorial();
    }, [user, backendUrl]);

    
    const mejorCAE = historial.length > 0 
        ? Math.min(...historial.map(sim => Number(sim.cae))) 
        : 0;

    
    const mejorCuota = historial.length > 0
        ? Math.min(...historial.map(sim => Number(sim.cuota_mensual)))
        : 0;

    return (
        <FillContainer>
            <div className="text-center mb-4">
                <h2 className="krona-one-regular text-primary">Mis Simulaciones Guardadas</h2>
                <p className="text-muted">Compara tus opciones y elige la mejor.</p>
            </div>
            
            <div className="table-responsive w-100 shadow-sm rounded-4 bg-white p-3">
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Fecha</th>
                            <th>Monto</th>
                            <th>Plazo</th>
                            <th>Cuota</th>
                            <th>CAE</th>
                            <th>Análisis</th> {/* Nueva columna */}
                        </tr>
                    </thead>
                    <tbody>
                        {historial.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-4">No tienes simulaciones guardadas</td></tr>
                        ) : (
                            historial.map((sim) => {
                                
                                const esMejorCAE = Number(sim.cae) === mejorCAE;
                                const esMejorCuota = Number(sim.cuota_mensual) === mejorCuota;

                                return (
                                    <tr key={sim.id} className={esMejorCAE ? "table-success" : ""}>
                                        <td>{new Date(sim.fecha_simulacion).toLocaleDateString()}</td>
                                        <td className="fw-bold">{parseMoneyStringMoney(sim.monto)}</td>
                                        <td>{sim.plazo} meses</td>
                                        <td>
                                            {parseMoneyStringMoney(sim.cuota_mensual)}
                                            {esMejorCuota && !esMejorCAE && (
                                                <div className="badge bg-info text-dark ms-2">💰 Baja</div>
                                            )}
                                        </td>
                                        <td className="fw-bold">
                                            {sim.cae}%
                                        </td>
                                        <td>
                                            {esMejorCAE && (
                                                <span className="badge bg-success border border-light shadow-sm">
                                                    🏆 Mejor Opción
                                                </span>
                                            )}
                                            {esMejorCuota && !esMejorCAE && (
                                                <span className="badge bg-light text-secondary border">
                                                    Más cómoda
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Leyenda explicativa */}
            {historial.length > 0 && (
                <div className="d-flex gap-3 mt-3 justify-content-center">
                    <small className="text-success fw-bold">🏆 Mejor Opción: El crédito más barato (Menor CAE).</small>
                    <small className="text-info fw-bold">💰 Baja: La cuota mensual más pequeña.</small>
                </div>
            )}
        </FillContainer>
    );
};

export default Historial;