import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import Span from "components/Span";
import WizardButton from "components/renderers/WizardButton";
import useWizard from 'context/wizardContext';

const WizardGoHomeButton = ({
    text,
    className,
    visible,
    ...props
}) => {
    const navigate = useNavigate();
    const wizard = useWizard();
    const useGoHomeButton = wizard.struct.useGoHomeButton ?? true;
    const redirectTo = wizard.struct.redirectTo ?? "/";
    const useBackend = wizard.struct.useBackend ?? false;
    const endSession = wizard.endSession;
    
    const isVisible = visible ?? useGoHomeButton ? (wizard.index === 0) : false;

    if (!isVisible) return null;

    return (
        <WizardButton
            type="button"
            text={text ?? (
                <Span>
                    <ArrowLeft size="1rem" />
                    {"Inicio"}
                </Span>
            )}
            className={className ?? "btn btn-secondary btn-opacity-25"}
            onClick={() => {
                if (useBackend) endSession();
                navigate(redirectTo)
            }}
            {...props}
        />
    );
};

export default WizardGoHomeButton;
