import { Fragment, useCallback } from "react";
import { useFormikContext } from "formik";

import useWizard from "context/wizardContext";
import {
    handleOptionalProp,
    handleOtherKey,
} from "utils/handlers";

import Select from "components/inputs/Select";
import Input from "components/inputs/Input";
import FileInput from "components/inputs/FileInput";
import SelectionInput from "components/inputs/SelectionInput";
import SelectableCard from "components/inputs/SelectableCard";

const RESERVED_FIELD_PROPS = [
    "id",
    "name",
    "type",
    "label",
    "title",
    "description",
    "placeholder",
    "textHelp",
    "options",
    "required",
    "min",
    "max",
    "default",
    "validation",
    "onChange",
    "otherField",
    "otherValue",
    "alwaysActive",
    "className",
    "accept",
    "multiple",
];

const getFieldProps = (field) => {
    const fieldProps = {};
    Object.entries(field).forEach(([key, value]) => {
        if (!RESERVED_FIELD_PROPS.includes(key)) {
            fieldProps[key] = value;
        }
    });
    return fieldProps;
};

const WizardField = ({
    field: fieldProp,
    values: valuesProp,
    handleBlur: handleBlurProp,
    errors: errorsProp,
    touched: touchedProp,
    ...props
}) => {
    const formikContext = useFormikContext();
    const wizard = useWizard();

    const values = valuesProp ?? formikContext.values;
    const handleBlur = handleBlurProp ?? formikContext.handleBlur;
    const errors = errorsProp ?? formikContext.errors;
    const touched = touchedProp ?? formikContext.touched;

    const { setFieldValue, setFieldTouched, handleChange } = formikContext;

    const getOnChange = useCallback((fieldItem, otherField = null) => {
        if (
            fieldItem.type === "checkbox" ||
            fieldItem.type === "switch" ||
            fieldItem.type === "card"
        ) {
            return (e) => {
                setFieldValue(fieldItem.name, e.target.checked);
            };
        }

        if (fieldItem.type === "file") {
            return (fileOrFiles) => {
                setFieldValue(fieldItem.name, fileOrFiles ?? null);
                setFieldTouched(fieldItem.name, true, false);
            };
        }

        if (fieldItem.type === "select") {
            return (value) => {
                setFieldValue(fieldItem.name, value);
                setFieldTouched(fieldItem.name, true, false);
            };
        }

        if (otherField?.onChange) {
            return (e) => otherField.onChange({
                e,
                field: handleOtherKey(fieldItem.name),
                ...formikContext,
                ...wizard,
                ...handleOptionalProp("min", otherField.min),
                ...handleOptionalProp("max", otherField.max),
            });
        }

        if (fieldItem.onChange) {
            return (e) => fieldItem.onChange({
                e,
                field: fieldItem.name,
                ...formikContext,
                ...wizard,
                ...handleOptionalProp("min", fieldItem.min),
                ...handleOptionalProp("max", fieldItem.max),
            });
        }

        return handleChange;
    }, [formikContext, handleChange, setFieldValue, setFieldTouched, wizard]);

    let field = fieldProp;

    if (typeof fieldProp === "string") {
        const currentStep = wizard.struct.steps[wizard.index];
        const allFields = currentStep.fields?.flat() ?? [];
        field = allFields.find((f) => f.name === fieldProp || f.id === fieldProp);
    }

    if (!field) return null;

    const fieldProps = getFieldProps(field);

    const baseProps = {
        id: field.id ?? field.name,
        name: field.name,
        type: field.type,
        label: field.label ?? field.name,
        onChange: getOnChange(field),
        onBlur: handleBlur,
        errors,
        touched,
        required: field.required ?? false,
        ...handleOptionalProp("placeholder", field.placeholder),
        ...handleOptionalProp("textHelp", field.textHelp),
        ...handleOptionalProp("min", field.min),
        ...handleOptionalProp("max", field.max),
        ...fieldProps,
        ...props,
    };

    if (field.type === "checkbox" || field.type === "switch") {
        return (
            <SelectionInput
                {...baseProps}
                checked={values[field.name] ?? false}
            />
        );
    }

    if (field.type === "card") {
        return (
            <SelectableCard
                {...baseProps}
                title={field.title}
                description={field.description}
                checked={values[field.name] ?? false}
                alwaysActive={field.alwaysActive ?? false}
                className={field.className}
            />
        );
    }

    if (field.type === "select") {
        return (
            <Fragment>
                <Select
                    {...baseProps}
                    options={field.options}
                    value={values[field.name] ?? ""}
                />
                {field.otherField &&
                    (values[field.name] ?? "") === (field.otherValue ?? "0") && (
                    <Input
                        id={handleOtherKey(field.id ?? field.name)}
                        name={handleOtherKey(field.name)}
                        type={field.otherField.type}
                        value={values[handleOtherKey(field.name)] ?? ""}
                        label={field.otherField.label ?? `${field.label ?? field.name} (Otro)`}
                        onChange={getOnChange(field, field.otherField)}
                        onBlur={handleBlur}
                        errors={errors}
                        touched={touched}
                        required={field.otherField.required ?? false}
                        {...handleOptionalProp("placeholder", field.otherField.placeholder)}
                        {...handleOptionalProp("textHelp", field.otherField.textHelp)}
                        {...handleOptionalProp("min", field.otherField.min)}
                        {...handleOptionalProp("max", field.otherField.max)}
                        {...getFieldProps(field.otherField)}
                        {...props}
                    />
                )}
            </Fragment>
        );
    }

    if (field.type === "file") {
        return (
            <FileInput
                {...baseProps}
                value={values[field.name] ?? null}
                accept={field.accept}
                multiple={field.multiple ?? false}
            />
        );
    }

    return (
        <Input
            {...baseProps}
            value={values[field.name] ?? ""}
        />
    );
};

export default WizardField;