import { z } from "zod";
import { createContext, useContext, useEffect, useRef } from "react";

import { handleCurrentValues, handleOtherKey } from "utils/handlers";
import { useFormData } from "hooks/useFormData";
import useStepValidation, { ADELANTE, ATRAS } from "hooks/useStepValidation";

const wizardContext = createContext(null);

export const WizardProvider = ({ children, struct, path }) => {
    const lastIndexRef = useRef(null);
    const initialValuesRef = useRef(null);
    const basePath = path;

    const steps = struct.steps;
    const storageKey = `wizard-form-${struct.id}`;
    const useStorage = true;

    const hasFieldNameOrId = (field) => field && (field.name || field.id);
    const getFieldNameOrId = (field) => field.name ?? field.id;
    const getFieldDefault = (field) => field.default ?? "";
    const getFieldValidation = (field) => field.validation;

    // data por defecto. se usara para generar el formData.
    const defaultData = steps.reduce((acc, step) => {
        if (!step.fields) return acc;

        step.fields.flat().forEach(field => {
            if (!hasFieldNameOrId(field)) return;

            const key = getFieldNameOrId(field);
            acc[key] = getFieldDefault(field);

            // other
            if (field.otherField) {
                const otherKey = handleOtherKey(key);
                acc[otherKey] = getFieldDefault(field.otherField);
            }
        });

        return acc;
    }, {});

    const normalizeValidations = (v) =>
        Array.isArray(v) ? v :
        v ? [v] :
        [];
    
    const applyStepValidations = (schema, stepValidations) => {
        const validations = normalizeValidations(stepValidations);

        return validations.reduce((acc, fn) => fn(acc), schema);
    };

    const schemas = steps.map(step => {
        if (!step.fields) return z.object({});

        const schemaObj = {};

        step.fields.flat().forEach(field => {
            if (!hasFieldNameOrId(field)) return;

            const key = getFieldNameOrId(field);
            schemaObj[key] = getFieldValidation(field) ?? z.any();
        });

        let schema = z.object(schemaObj);
        schema = applyStepValidations(schema, step.validations);
        return schema;
    });

    // se genera el formData donde se guardaran los datos de cada field y ls setters
    const { getFormData, setField, setFields, hasSavedData } = useFormData(defaultData, useStorage, storageKey);

    const { nextStep, prevStep, goStep, currIndex, direction } = useStepValidation({
        steps,
        schemas,
        basePath,
        getFormData,
        hasSavedData,
    });

    if (lastIndexRef.current !== currIndex) {
        initialValuesRef.current = handleCurrentValues(
            getFormData(),
            struct.steps[currIndex]
        );
        lastIndexRef.current = currIndex;
    }
    const initialValues = initialValuesRef.current;
    const index = lastIndexRef.current;

    // solo borra el formData en memoria si te sales del flujo del formulario
    useEffect(() => {
        return () => {
            if (useStorage) {
                sessionStorage.removeItem(storageKey);
            }
        }
    }, [useStorage, storageKey]);

    return (
        <wizardContext.Provider
            value={{
                struct,
                index,
                length: struct.steps.length,
                schemas,
                initialValues,
                defaultData,
                getFormData,
                setField,
                setFields,
                nextStep,
                prevStep,
                goStep,
                hasFieldNameOrId,
                getFieldNameOrId,
                basePath,
                direction,
                ADELANTE,
                ATRAS,
            }}
        >
            {children}
        </wizardContext.Provider>
    );
};

const useWizard = () => useContext(wizardContext);
export default useWizard;