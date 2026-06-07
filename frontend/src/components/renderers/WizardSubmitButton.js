import Span from "components/Span";
import useWizard from "context/wizardContext";
import WizardButton from "components/renderers/WizardButton";

const WizardSubmitButton = ({
    text,
    className = "btn btn-primary",
    loading = false,
    visible,
    ...props
}) => {
    const wizard = useWizard();
    const submitText = wizard.struct.submitButtonText;

    const isVisible = visible ?? (wizard.index === wizard.length - 1);

    if (!isVisible) return null;

    return (
        <WizardButton
            type="submit"
            text={text ?? (
                <Span>
                    {submitText ?? "Enviar"}
                </Span>
            )}
            className={className}
            loading={loading}
            {...props}
        />
    );
};

export default WizardSubmitButton;
