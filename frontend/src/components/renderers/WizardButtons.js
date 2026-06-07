import { isValidElement } from "react";
import { useFormikContext } from "formik";

import useWizard from "context/wizardContext";
import WizardButton from "components/renderers/WizardButton";
import WizardNextButton from "components/renderers/WizardNextButton";
import WizardBackButton from "components/renderers/WizardBackButton";
import WizardSubmitButton from "components/renderers/WizardSubmitButton";
import WizardGoHomeButton from "components/renderers/WizardGoHomeButton";

const WizardButtons = ({ index, length, struct }) => {
    const wizard = useWizard();
    const { isSubmitting } = useFormikContext();

    index ??= wizard.index;
    length ??= wizard.length;
    struct ??= wizard.struct;

    const topButtons = struct.steps[index].topButtons ?? [];
    const bottomButtons = struct.steps[index].bottomButtons ?? [];
    const submitText = struct.submitButtonText;
    const continueText = struct.steps[index].continueButtonText;
    const backText = struct.steps[index].backButtonText;
    const goHomeText = struct.goHomeButtonText;

    const useGoHomeButton = wizard.struct.useGoHomeButton ?? true;

    const buttons = [];
    buttons.push(...topButtons);

    if (index === length - 1) {
        buttons.push(
            <WizardSubmitButton
                key="wizard-submit"
                text={submitText}
                visible={true}
                loading={isSubmitting}
            />
        );
        if (length !== 1) {
            buttons.push(
                <WizardBackButton
                    key="wizard-back"
                    text={backText}
                    visible={true}
                />
            );
        }
    } else if (index === 0) {
        buttons.push(
            <WizardNextButton
                key="wizard-next"
                text={continueText}
                visible={true}
                loading={isSubmitting}
            />
        );
    } else {
        buttons.push(
            <WizardNextButton
                key="wizard-next"
                text={continueText}
                visible={true}
                loading={isSubmitting}
            />
        );
        buttons.push(
            <WizardBackButton
                key="wizard-back"
                text={backText}
                visible={true}
            />
        );
    }

    if (useGoHomeButton && index === 0) {
        buttons.push(
            <WizardGoHomeButton
                key="wizard-go-home"
                text={goHomeText}
                visible={true}
            />
        );
    }

    const finalButtons = [...buttons, ...bottomButtons];

    return (
        <>
            {finalButtons.map((button, idx) => {
                if (isValidElement(button)) {
                    return button;
                }

                return (
                    <WizardButton
                        key={button.id ?? button.name ?? idx}
                        {...button}
                        loading={button.type === "submit" && isSubmitting}
                    />
                );
            })}
        </>
    );
};

export default WizardButtons;
