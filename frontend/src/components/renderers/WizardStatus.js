import { useFormikContext } from "formik";

import {
    CircleAlert,
    CircleCheck,
    Info
} from "lucide-react";

import Span from "components/Span";

const TYPE_ELEMENTS = {
    error: {
        className: "text-danger",
        icon: <CircleAlert size={16} />,
        message: "Ocurrió un error, vuelve a intentarlo más tarde."
    },
    warning: {
        className: "text-warning",
        icon: <CircleAlert size={16} />,
        message: "Advertencia."
    },
    success: {
        className: "text-success",
        icon: <CircleCheck size={16} />,
        message: "Operación realizada correctamente."
    },
    info: {
        className: "text-info",
        icon: <Info size={16} />,
        message: "Información."
    }
};

const DEFAULT_TYPE = "error";

const WizardStatus = ({
    status,
    className
}) => {
    const { status: formStatus } = useFormikContext();
    const rawMessage = status ?? formStatus;

    if (!rawMessage) return null;

    const normalized = typeof rawMessage === "string" ? { type: DEFAULT_TYPE, message: rawMessage } : rawMessage;

    const type = normalized.type ?? DEFAULT_TYPE;
    const config = TYPE_ELEMENTS[type] ?? TYPE_ELEMENTS[DEFAULT_TYPE];

    const finalClassName = className ?? config.className;
    const finalIcon = normalized.icon ?? config.icon;

    const finalMessage = normalized.message ?? config.message;

    return (
        <Span className={finalClassName}>
            {finalIcon}
            {finalMessage}
        </Span>
    );
};

export default WizardStatus;