import { ArrowRight } from 'lucide-react';

import Span from "components/Span";
import useWizard from "context/wizardContext";
import WizardButton from "components/renderers/WizardButton";

const WizardNextButton = ({
    text,
    className = "btn btn-primary",
    visible,
    ...props
}) => {
    const wizard = useWizard();
    const continueText = wizard.struct.steps[wizard.index]?.continueButtonText;

    const isVisible = visible ?? (wizard.index < wizard.length - 1);

    if (!isVisible) return null;

    return (
        <WizardButton
            type="submit"
            text={text ?? (
                <Span>
                    {continueText ?? "Continuar"}
                    <ArrowRight size="1rem" />
                </Span>
            )}
            className={className}
            {...props}
        />
    );
};

export default WizardNextButton;
