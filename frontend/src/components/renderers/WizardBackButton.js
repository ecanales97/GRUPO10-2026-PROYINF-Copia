import { ArrowLeft } from 'lucide-react';

import Span from "components/Span";
import useWizard from "context/wizardContext";
import WizardButton from "components/renderers/WizardButton";

const WizardBackButton = ({
    text,
    className,
    onClick,
    visible,
    ...props
}) => {
    const wizard = useWizard();
    const backText = wizard.struct.steps[wizard.index]?.backButtonText;

    const isVisible = visible ?? (wizard.index > 0);

    if (!isVisible) return null;

    return (
        <WizardButton
            type="button"
            text={text ?? (
                <Span>
                    <ArrowLeft size="1rem" />
                    {backText ?? "Regresar"}
                </Span>
            )}
            className={className ?? "btn btn-secondary btn-opacity-25"}
            onClick={(args) => {
                onClick?.(args);
                wizard.prevStep();
            }}
            {...props}
        />
    );
};

export default WizardBackButton;
