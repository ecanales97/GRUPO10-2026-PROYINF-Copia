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
        // type,

        amount,
        termMonthly,

        downPayment,
        itemValue,
        itemType,
        // itemTypeId,

        rateType,
        // rateTypeId,

        monthlyInstallment,
        monthlyRate,
        annualRate,

        apr, // cae
        tcc, // ctc
        tco,

        firstPaymentDate,

        upfrontCosts,
        monthlyCosts,
    } = data;

    const simulationCardList = (struct) => {
        return (
            <div className="d-flex flex-column">
                { Object.entries(struct).map(([label, value]) => (
                    <div className="d-flex flex-row justify-content-between" key={label}>
                        <Span className="small">{label}</Span>
                        <Span className="small text-end fw-semibold">{value}</Span>
                    </div>
                )) }
            </div>
        );
    };
    
    return (
        <div className={`${isSelected ? "card-selected" : "card-not-selected"} d-flex flex-column gap-2 p-3 px-4 rounded-1`} style={{ cursor: "pointer" }} onClick={() => onSelect(data)}>
            <div className="d-flex flex-row justify-content-between">
                {recommended ? <Sparkles size={"2.5rem"} strokeWidth={1.25} /> : <div/>}
                <div className={`d-flex card-element-border rounded-5 p-2 px-3 w-auto fw-medium`}>
                    {isSelected ?
                    <Span>
                        <CircleCheck size={16} />
                        {" "}
                        Seleccionado
                    </Span> :
                    <Span>
                        <Circle size={16} />
                        {" "}
                        Seleccionar
                    </Span>
                }
                </div>
            </div>
            <Span className="small">{recommended ? recommended : "Tu simulación"}</Span>

            <Span className="fs-3 krona-one-regular">
                {parseMoneyStringMoney(amount)}
            </Span>

            {!!downPayment && !!itemValue && simulationCardList({
                [`Valor (${itemType})`]: parseMoneyStringMoney(itemValue),
                "Pie": parseMoneyStringMoney(downPayment),
            })}

            {simulationCardList({
                "Cuota Mensual": parseMoneyStringMoney(monthlyInstallment),
                "Cuotas": `${termMonthly} ${termMonthly === 1 ? "Mes" : "Meses"}`,
                "Tipo de Tasa": `${rateType}`,
                "Fecha Primer Pago": new Date(firstPaymentDate).toLocaleDateString(),
            })}

            {simulationCardList({
                "Costo Inicial": `${parseMoneyStringMoney(upfrontCosts)}`,
                "Costos mensuales": `${parseMoneyStringMoney(monthlyCosts)}`,
                "CTC": parseMoneyStringMoney(tcc),
                ...(downPayment
                    ? {"CTC + Pie": parseMoneyStringMoney(tco)}
                    : {}),
                "CAE": apr,
                "Interés Mensual": monthlyRate,
                "Interés Anual": annualRate,
            })}
        </div>
    )
};

export default SimulationCard;