import { useFormikContext } from "formik";

import useWizard from "context/wizardContext";

import Container from "components/containers/Container";
import Surface from "components/containers/Surface";
import WizardHeader from "components/renderers/WizardHeader";
import WizardStepper from "components/renderers/WizardStepper";
import WizardFields from "components/renderers/WizardFields";
import WizardStatus from "components/renderers/WizardStatus";

const WizardStep = ({ index, length, struct }) => {
    const wizard = useWizard();
    const formikContext = useFormikContext();

    index ??= wizard.index;
    length ??= wizard.length;
    struct ??= wizard.struct;

    const currentStep = struct.steps[index];

    return (
        <Container className="flex-grow-1 justify-content-center gap-3 w-100">
            <WizardHeader index={index} struct={struct} />
            <WizardStepper index={index} length={length} struct={struct} />
            <Surface className="rounded-2">
                {currentStep.name &&
                    <Container className="px-4 py-3 border-bottom border-primary border-opacity-10 bg-body bg-opacity-25 user-select-none">
                        {currentStep.name}
                    </Container>
                }
                <Container className={`${currentStep.name ? "pt-3" : ""} p-4`}>
                    {currentStep.contentForm && currentStep.contentForm({
                        ...formikContext,
                        ...wizard,
                    })}
                    <WizardFields index={index} struct={struct} />
                    <WizardStatus />
                </Container>
            </Surface>
        </Container>
    );
};

export default WizardStep;
