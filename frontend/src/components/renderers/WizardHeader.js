import { useFormikContext } from "formik";
import { Dot } from 'lucide-react';

import useWizard from "context/wizardContext";
import Container from "components/containers/Container";
import Span from "components/Span";

const WizardHeader = ({
    index,
    struct,
}) => {
    const wizard = useWizard();
    const formikContext = useFormikContext();

    index ??= wizard.index;
    struct ??= wizard.struct;

    const step = struct.steps[index];

    return (
        <Container className="fit-flex-fixed justify-content-end gap-3">
            {struct.name && (
                <Container className="w-fit bg-primary bg-opacity-15 border border-primary border-opacity-50 p-1 pe-3 rounded-pill align-items-center">
                    <Span className="small ibm-plex-mono-regular text-uppercase user-select-none">
                        <Dot size={16}/>
                        {struct.name}
                    </Span>
                </Container>
            )}

            {step.title && (
                <h1 className="display-1 baskervville-italic text-uppercase mb-0">
                    {step.title}
                </h1>
            )}

            {step.content && step.content({
                ...formikContext,
                ...wizard,
            })}
        </Container>
    );
};

export default WizardHeader;
