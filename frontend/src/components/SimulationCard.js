import { 
    // Save, 
    Circle, 
    CircleCheck, 
    // ArrowRight, 
    // Form, 
    Sparkles 
} from 'lucide-react';

import { parseMoneyStringMoney } from "utils/parsers";
import Span from "./Span";

const SimulationCard = ({
    data,
    recommended,
    isSelected,
    onSelect,
}) => {
    const {
        amount,
        termMonthly,
        monthlyInstallment,
        tcc,
        apr,
        monthlyRate,
        annualRate,
        firstPaymentDate
    } = data;
    return (
        <div className={`${isSelected ? "card-selected" : "card-not-selected"} d-flex flex-column gap-2 p-3 px-4 rounded-1`} style={{ cursor: "pointer" }} onClick={() => onSelect(data)}>
            <div className="d-flex flex-row justify-content-between">
                {recommended ? <Sparkles size={"2.5rem"} strokeWidth={1.25} /> : <div/>}
                <div className={`d-flex card-element-border rounded-5 p-2 px-3 w-auto fw-medium`}>
                    {isSelected ?
                    <Span className="gap-2">
                        <CircleCheck />
                        Seleccionado
                    </Span> :
                    <Span className="gap-2">
                        <Circle />
                        Seleccionar
                    </Span>
                }
                </div>
            </div>
            <Span className="small">{recommended ? recommended : "Tu simulación"}</Span>

            <Span className="fs-3 krona-one-regular">
                {parseMoneyStringMoney(amount)}
            </Span>

            <div className="d-flex flex-column">
                {Object.entries({
                    "Cuota Mensual": parseMoneyStringMoney(monthlyInstallment),
                    "Cuotas": `${termMonthly} ${termMonthly === 1 ? "Mes" : "Meses"}`,
                    "CTC": parseMoneyStringMoney(tcc),
                    "CAE": apr,
                    "Interés Mensual": monthlyRate,
                    "Interés Anual": annualRate,
                    "Fecha Primer Pago": new Date(firstPaymentDate).toLocaleDateString(),
                }).map(([label, value]) => (
                    <div className="d-flex flex-row justify-content-between" key={label}>
                        <Span className="small">{label}</Span>
                        <Span className="small text-end fw-semibold">{value}</Span>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default SimulationCard;