import { Fragment } from "react";

import useWizard from "context/wizardContext";

import WizardField from "components/renderers/WizardField";

const WizardFields = ({ index, struct }) => {
    const wizard = useWizard();

    index ??= wizard.index;
    struct ??= wizard.struct;

    const currentStep = struct.steps[index];
    const rawFields = currentStep.fields ?? [];
    const normalizedFields = Array.isArray(rawFields[0]) ? rawFields : [rawFields];

    return normalizedFields.map((fields, indexFields) => {
        if (!(currentStep.contentForm || fields.length !== 0)) return null;

        return (
            <Fragment key={indexFields}>
                {fields.map((field, indexField) => (
                    <Fragment key={field.id ?? field.name ?? indexField}>
                        <WizardField field={field} />
                    </Fragment>
                ))}
            </Fragment>
        );
    });
};

export default WizardFields;
