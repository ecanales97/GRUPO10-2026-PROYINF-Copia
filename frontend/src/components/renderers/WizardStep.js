import { Fragment, useCallback, } from "react";
import { useFormikContext } from "formik";

import { Dot } from 'lucide-react';

import useWizard from "context/wizardContext";

import { handleOptionalProp, handleOtherKey } from "utils/handlers";

import Select from "components/inputs/Select";
import Input from "components/inputs/Input";
import Span from "components/Span";
import Container from "components/containers/Container";
import Surface, { SurfaceRow } from "components/containers/Surface";
import SelectionInput from "components/inputs/SelectionInput";

const WizardStep = ({index, length, struct}) => {
    const formikContext = useFormikContext();
    const { values, handleBlur, errors, touched, status } = formikContext;
    const wizardContext = useWizard();
    const { goStep } = wizardContext;

    const getOnChange = useCallback((field, otherField = null) => {
        const { setFieldValue } = formikContext;
        if (field.type === "checkbox" || field.type === "switch") {
            return (e) => {
                setFieldValue(field.name, e.target.checked);
            };
        }
        else if (otherField && otherField.onChange) {
            return (e) => otherField.onChange({
                e,
                field:handleOtherKey(field.name),
                ...formikContext,
                ...wizardContext,
                ...handleOptionalProp("min", otherField.min),
                ...handleOptionalProp("max", otherField.max),
            })
        } else if (field.onChange) {
            return (e) => field.onChange({
                e,
                field:field.name,
                ...formikContext,
                ...wizardContext,
                ...handleOptionalProp("min", field.min),
                ...handleOptionalProp("max", field.max),
            })
        }
        const { handleChange } = formikContext;
        return handleChange;
    }, [wizardContext, formikContext]);

    const rawFields = struct.steps[index].fields ?? [];
    const normalizedFields = Array.isArray(rawFields[0]) ? rawFields : [rawFields];

    return (
        <Container
            className="d-flex flex-column justify-content-center gap-3 w-100"
        >
            <Container className="fit-flex-fixed justify-content-end gap-3">
                { struct.name && 
                <Container className="w-fit bg-primary bg-opacity-15 border border-primary border-opacity-50 p-1 pe-3 rounded-pill">
                    <Span className="small ibm-plex-mono-regular text-uppercase user-select-none">
                        <Dot />
                        {struct.name}
                    </Span>
                </Container>
                }

                { struct.steps[index].title &&
                    <h1 className="display-1 baskervville-italic text-uppercase mb-0">
                        {struct.steps[index].title}
                    </h1>
                }
                
                { struct.steps[index].content && struct.steps[index].content({
                    ...formikContext, ...wizardContext,
                })}
            </Container>

            {
                struct.stepper ? (
                    <SurfaceRow className="align-items-center px-4 py-3 rounded-2">
                        {struct.steps.map((step, indexStep) => {
                            return (
                                <Fragment key={indexStep}>
                                    <div
                                        className={`d-flex justify-content-center align-items-center border ${indexStep === index ? "bg-primary text-black" : "bg-body bg-opacity-50"} ${indexStep > index ? "opacity-25" : "cursor-pointer"} border-primary rounded-pill user-select-none`}
                                        style={{
                                            width: "2rem",
                                            height: "2rem",
                                        }}
                                        onClick={() => {
                                            if (indexStep <= index) {
                                                goStep(indexStep);
                                            }
                                        }}
                                    >
                                        {indexStep+1}
                                    </div>
                                    {
                                        (indexStep + 1) !== length &&
                                        <div className={`d-flex fit-flex bg-primary ${indexStep >= index ? "bg-opacity-25" : ""}`} style={{
                                            height: "1px",
                                        }}></div>
                                    }
                                </Fragment>
                            )
                        })}
                    </SurfaceRow>
                ) : (
                    <></>
                )
            }
            
            {normalizedFields.map((fields, indexFields) => {
                if (!( struct.steps[index].contentForm || fields.length !== 0 )) return null;
                return (
                    <Surface key={indexFields} className="rounded-2">
                        {struct.steps[index].name &&
                        <Container className="px-4 py-3 border-bottom border-primary border-opacity-10 bg-body bg-opacity-25 user-select-none">
                            <Span>
                                {struct.steps[index].name}
                            </Span>
                        </Container>
                        }
                        <Container className={`${struct.steps[index].name ? "pt-3" : ""} p-4`}>
                        {struct.steps[index].contentForm && struct.steps[index].contentForm({
                            ...formikContext, ...wizardContext,
                        })}
                        {fields.map((field, indexField) => {
                            if (field.type === "checkbox" || field.type === "switch") {
                                return (
                                    <SelectionInput
                                        key={field.id ?? field.name ?? indexField}
                                        type={field.type}
                                        id={field.id ?? field.name}
                                        name={field.name}
                                        label={field.label ?? field.name}
                                        checked={values[field.name] ?? false}
                                        onChange={getOnChange(field)}
                                        onBlur={handleBlur}
                                        required={field.required ?? false}
                                        {...handleOptionalProp("textHelp",field.textHelp)}
                                        errors={errors}
                                        touched={touched}
                                    />
                                )
                            }
                            else if (field.type === "select") {
                                return (
                                    <Fragment
                                        key={field.id ?? field.name ?? indexField}
                                    >
                                        <Select
                                            id={field.id ?? field.name}
                                            name={field.name}
                                            type={field.type}
                                            value={values[field.name] ?? ""}
                                            options={field.options}
                                            label={field.label ?? field.name}
                                            {...handleOptionalProp("placeholder",field.placeholder)}
                                            {...handleOptionalProp("textHelp",field.textHelp)}
                                            onChange={getOnChange(field)}
                                            onBlur={handleBlur}
                                            errors={errors}
                                            touched={touched}
                                            required={field.required ?? false}
                                        />

                                        { field.otherField && (values[field.name] ?? "") === (field.otherValue ?? "0") && (
                                            <Input
                                                id={handleOtherKey((field.id ?? field.name))}
                                                name={handleOtherKey((field.name))}
                                                type={field.otherField.type}
                                                value={values[handleOtherKey((field.name))] ?? ""}
                                                label={field.otherField.label ?? `${field.label ?? field.name} (Otro)`}
                                                {...handleOptionalProp("placeholder",field.otherField.placeholder)}
                                                {...handleOptionalProp("textHelp",field.otherField.textHelp)}
                                                {...handleOptionalProp("min",field.otherField.min)}
                                                {...handleOptionalProp("max",field.otherField.max)}
                                                onChange={getOnChange(field,field.otherField)}
                                                onBlur={handleBlur}
                                                errors={errors}
                                                touched={touched}
                                                required={field.otherField.required ?? false}
                                            />
                                        )}
                                    </Fragment>
                                );
                            } else {
                                return (
                                    <Input
                                        key={field.id ?? field.name ?? indexField}
                                        id={field.id ?? field.name}
                                        name={field.name}
                                        type={field.type}
                                        value={values[field.name] ?? ""}
                                        label={field.label ?? field.name}
                                        {...handleOptionalProp("placeholder",field.placeholder)}
                                        {...handleOptionalProp("textHelp",field.textHelp)}
                                        {...handleOptionalProp("min",field.min)}
                                        {...handleOptionalProp("max",field.max)}
                                        onChange={getOnChange(field)}
                                        onBlur={handleBlur}
                                        errors={errors}
                                        touched={touched}
                                        required={field.required ?? false}
                                    />
                                );
                            }
                        })}
                        
                        { status && (
                            <Span className="text-danger">
                                {status}
                            </Span>
                        ) }
                        </Container>
                    </Surface>
                )
            })}
        </Container>
    );
};

export default WizardStep;