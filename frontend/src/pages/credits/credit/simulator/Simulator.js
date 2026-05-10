import { ArrowRight } from "lucide-react";

import { useAuth } from "context/authContext";
import { useCredit } from "hooks/useCredit";

import { WizardRouter } from "components/renderers/WizardRenderer";

import Span from "components/Span";
import Highlights from "components/Highlights";

import FIELDS from "config/fields";
import PATH from "config/paths";

import { objectValidations } from "shared/schemas/schema.js";

import Result from "./Result";

export const Simulator = ({ path }) => {
    const { isAuthenticated } = useAuth();
    const { creditType, pathType, credit } = useCredit();

    const buildButtonText = (text) => (
        <Span>
            {text}
            <ArrowRight size={"1rem"} />
        </Span>
    );

    // SUBMIT

    const onSubmit = async ({
        getFormData,
        setSubmitting,
        setStatus,
        navigate,
    }) => {
        try {
            const formData = getFormData();

            if (!formData.selected) return;

            navigate(
                PATH.credits.credit.apply.build({
                    creditType: pathType,
                }),
                {
                    state: {
                        apply: formData.selected,
                    },
                }
            );
        } catch (error) {
            console.error("ERROR:", error);

            setStatus(error);
            setSubmitting(false);
        }
    };

    // BUTTONS

    const BUTTONS = {
        CONTINUE_ACCOUNT: isAuthenticated
            ? buildButtonText("Continuar con mi cuenta")
            : null,

        CONTINUE_SIMULATION: buildButtonText("Simular mi crédito"),

        SUBMIT: buildButtonText("Solicitar mi crédito"),
    };

    // FIELDS

    const identityFields = isAuthenticated
        ? {
            useSimplePersonalInformation: {},
        }
        : {
            nationalId: {},
            useSimplePersonalInformation: {},
        };

    const commonConsumptionFields = {
        amount: credit.parameters.amount,
        termMonthly: credit.parameters.term,
        firstPaymentDate: credit.parameters.gracePeriodMonths,
    };

    const commonMortgageFields = {
        propertyValue: credit.parameters.propertyValue,
        propertyType: {},
        downPayment: credit.parameters.downPayment,
        termMonthly: credit.parameters.term,
        rateType: {},
        firstPaymentDate: credit.parameters.gracePeriodMonths,
    };

    const clientFields = {
        income: {},
    };

    const creditFields = (() => {
        if (creditType === "consumption") {
            return {
                ...(!isAuthenticated ? clientFields : {}),
                ...commonConsumptionFields,
            };
        }

        if (creditType === "mortgage") {
            return {
                ...(!isAuthenticated ? clientFields : {}),
                ...commonMortgageFields,
            };
        }

        return {};
    })();

    // STEPS

    const steps = [
        {
            path: "",
            name: "Identidad",
            title: `Simula tu ${credit.meta.fullName}`,
            content: () => (
                <Highlights
                    highlights={[
                        "Es facil",
                        "Es rapido",
                        "Sin compromisos",
                    ]}
                />
            ),
            validations: objectValidations.useSimplePersonalInformation(),
            fields: FIELDS(identityFields, {
                asList: true,
            }),
            continueButtonText: BUTTONS.CONTINUE_ACCOUNT,
        },

        {
            path: "datos",
            name: "Datos del crédito",
            fields: FIELDS(creditFields, {
                asList: true,
            }),
            validations: creditType === "mortgage"
                ? objectValidations.downPayment(credit.parameters.downPayment)
                : undefined,
            continueButtonText: BUTTONS.CONTINUE_SIMULATION,
        },

        {
            path: "resultado",
            name: "Resultados de tu simulación",
            contentForm: () => <Result />,
        },
    ];

    // STRUCT

    const struct = {
        id: "simulator",
        name: "Simulador",

        stepper: true,

        submitButtonText: BUTTONS.SUBMIT,

        onSubmit,
        steps,
    };

    return WizardRouter(struct, path);
};

export default Simulator;