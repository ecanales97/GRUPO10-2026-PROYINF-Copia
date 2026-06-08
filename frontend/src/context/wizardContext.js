import { z } from "zod";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Form } from "formik";

import { handleValidation, handleData } from "utils/handlers";
import { handleCurrentValues, handleOtherKey } from "utils/handlers";

import { useFormData } from "hooks/useFormData";
import useStepValidation, { ADELANTE, ATRAS } from "hooks/useStepValidation";

import Modal from "components/Modal";

import WizardStep         from "components/renderers/WizardStep";
import WizardHeader       from "components/renderers/WizardHeader";
import WizardStepper      from "components/renderers/WizardStepper";
import WizardFields       from "components/renderers/WizardFields";
import WizardField        from "components/renderers/WizardField";
import WizardButtons      from "components/renderers/WizardButtons";
import WizardButton       from "components/renderers/WizardButton";
import WizardNextButton   from "components/renderers/WizardNextButton";
import WizardBackButton   from "components/renderers/WizardBackButton";
import WizardSubmitButton from "components/renderers/WizardSubmitButton";
import WizardGoHomeButton from "components/renderers/WizardGoHomeButton";
import WizardStatus       from "components/renderers/WizardStatus";
import WizardAnimated     from "components/renderers/WizardAnimated";

import { backendUrl } from "utils/backend";
import { useAuth } from "./authContext";

const wizardContext = createContext(null);

export const WizardProvider = ({ children, struct, path }) => {
    const lastIndexRef = useRef(null);
    const lastRefreshRef = useRef(null);
    const initialValuesRef = useRef(null);

    const basePath = path;

    const steps      = struct.steps;
    const storageKey = `wizard-form-${struct.id ?? "key"}`;
    const useStorage = struct.useStorage ?? true;
    const useRouting = struct.useRouting ?? true;
    const useBackend = struct.useBackend ?? false;

    const hasFieldNameOrId   = (field) => field && (field.name || field.id);
    const getFieldNameOrId   = (field) => field.name ?? field.id;
    const getFieldDefault    = (field) => field.default ?? "";
    const getFieldValidation = (field) => field.validation;

    const defaultData = steps.reduce((acc, step) => {
        if (!step.fields) return acc;
        step.fields.flat().forEach(field => {
            if (!hasFieldNameOrId(field)) return;
            const key = getFieldNameOrId(field);
            acc[key] = getFieldDefault(field);
            if (field.otherField) {
                acc[handleOtherKey(key)] = getFieldDefault(field.otherField);
            }
        });
        return acc;
    }, {});

    const normalizeValidations = (v) =>
        Array.isArray(v) ? v : v ? [v] : [];

    const applyStepValidations = (schema, stepValidations) =>
        normalizeValidations(stepValidations).reduce((acc, fn) => fn(acc), schema);

    const schemas = steps.map(step => {
        if (!step.fields) return z.object({});
        const schemaObj = {};
        step.fields.flat().forEach(field => {
            if (!hasFieldNameOrId(field)) return;
            schemaObj[getFieldNameOrId(field)] = getFieldValidation(field) ?? z.any();
        });
        let schema = z.object(schemaObj);
        schema = applyStepValidations(schema, step.validations);
        return schema;
    });

    const backendConfig = useBackend
        ? { wizardType: struct.backendId ?? struct.id }
        : {};

    const formDataHelpers = useFormData(
        defaultData,
        useStorage,
        storageKey,
        useBackend,
        backendConfig,
    );
    const { getFormData, hasSavedData, refresh } = formDataHelpers;

    const stepValidationHelpers = useStepValidation({
        steps,
        schemas,
        basePath,
        getFormData,
        hasSavedData,
        useRouting,
    });
    const { currIndex } = stepValidationHelpers;

    if (
        lastIndexRef.current !== currIndex ||
        lastRefreshRef.current !== refresh
    ) {
        initialValuesRef.current = handleCurrentValues(
            getFormData(),
            struct.steps[currIndex]
        );
        lastIndexRef.current = currIndex;
        lastRefreshRef.current = refresh;
    }

    const initialValues = initialValuesRef.current;
    const index         = lastIndexRef.current;

    useEffect(() => {
        return () => {
            if (useStorage) sessionStorage.removeItem(storageKey);
        };
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
                ...formDataHelpers,
                ...stepValidationHelpers,
                useBackend,
                useStorage,
                hasFieldNameOrId,
                getFieldNameOrId,
                basePath,
                ADELANTE,
                ATRAS,
            }}
        >
            {children}
        </wizardContext.Provider>
    );
};

const WizardInner = ({ struct, navigate, children }) => {
    const ctx = useWizard();
    const { refreshUser } = useAuth();

    const {
        schemas,
        getFormData,
        setFields,
        index,
        nextStep,
        goStep,
        useBackend,
        getSessionId,
        startSession,
        resumeSession,
        endSession,
        syncFromBackend,
    } = ctx;

    const [expiredModal, setExpiredModal] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const pendingErrorsRef = useRef(null);

    useEffect(() => {
        if (!useBackend) return;

        const wzdParam = searchParams.get("wzd");

        const init = async () => {
            try {
                if (wzdParam) {
                    await resumeSession(wzdParam);
                } else {
                    const wzd = await startSession();
                    setSearchParams(p => { p.set("wzd", wzd); return p; }, { replace: true });
                }
            } catch (err) {
                if (err?.expired || wzdParam) setExpiredModal(true);
            }
        };

        init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useBackend]);

    useEffect(() => {
        if (!useBackend) return;
        const wzd = getSessionId();
        if (!wzd) return;
        setSearchParams(p => { p.set("wzd", wzd); return p; }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, useBackend]);

    async function handleFrontendSubmit(values, helpers) {
        setFields(values);
        if (index === struct.steps.length - 1) {
            await struct.onSubmit({
                formData: handleData(getFormData()),
                navigate,
                ...ctx,
                ...helpers,
            });
        } else {
            nextStep();
        }
    }

    async function handleBackendSubmit(values, helpers) {
        const wzd = getSessionId();
        const wizardType = struct.backendId ?? struct.id;

        if (!wzd) {
            helpers.setStatus("Error iniciando sesión.");
            return;
        }

        try {
            await setFields(values);
        } catch (err) {
            // console.log("a");
            if (err?.expired) {
                setExpiredModal(true);
                return;
            }
            if (err?.code === "EXPIRED_SESSION") {
                refreshUser();
                return;
            }
            // console.log(err);
            helpers.setStatus("Error guardando los datos.");
            return;
        }

        try {
            const res = await fetch(
                `${backendUrl}/api/wizard/${wizardType}/step/${index}?wzd=${wzd}`,
                { method: "POST", credentials: "include" },
            );

            const data = await res.json();
            // console.log(res);
            // console.log(data);
            // console.log(data.errors);
            // console.log(data.readonlyErrors);

            if (res.status === 410) { setExpiredModal(true); return; }

            if (res.status === 422) {
                if (data.failedStep !== undefined && data.failedStep !== index) {
                    await syncFromBackend();
                    pendingErrorsRef.current = { stepIndex: data.failedStep, errors: data.errors };
                    goStep(data.failedStep);
                    return;
                }

                if (data.readonlyErrors && Object.keys(data.readonlyErrors).length > 0) {
                    // console.log("b");
                    helpers.setStatus(
                        Object.values(data.readonlyErrors)[0]
                    );
                }

                if (data.errors && Object.keys(data.errors).length > 0) {
                    // console.log("c");
                    helpers.setErrors(data.errors);
                }

                return;
            }

            if (!res.ok) {
                // console.log("d");
                helpers.setStatus(data.error ?? "Error desconocido.");
                return;
            }

            await syncFromBackend();
            if (data.done) {
                await syncFromBackend();
                if (struct.onSubmit) {
                    await struct.onSubmit({
                        formData: handleData(getFormData()),
                        navigate,
                        ...ctx,
                        ...helpers
                    });
                } else {
                    navigate(struct.redirectTo ?? "/");
                }
                await endSession();
            } else {
                nextStep();
            }
        } catch {
            helpers.setStatus("Error de conexión.");
        }
    }

    const handleExpiredRestart = async () => {
        setExpiredModal(false);
        try {
            const wzd = await startSession();
            setSearchParams(p => { p.set("wzd", wzd); return p; }, { replace: true });
            goStep(0);
        } catch {
            navigate(0);
        }
    };

    const handleExpiredGoHome = () => {
        setExpiredModal(false);
        navigate(struct.redirectTo ?? "/");
    };

    return (
        <>
            {useBackend && (
                <Modal
                    active={expiredModal}
                    title="Sesión expirada"
                    onClose={handleExpiredGoHome}
                    onConfirm={handleExpiredRestart}
                    confirmText="Reiniciar"
                    cancelText="Salir"
                >
                    <p className="m-0">
                        Tu sesión ha expirado o no es válida. Puedes reiniciar
                        el formulario desde el principio o volver al inicio.
                    </p>
                </Modal>
            )}

            <Formik
                initialValues={ctx.initialValues}
                initialErrors={
                    pendingErrorsRef.current?.stepIndex === index
                        ? pendingErrorsRef.current.errors
                        : {}
                }
                initialTouched={
                    pendingErrorsRef.current?.stepIndex === index
                        ? Object.fromEntries(
                            Object.keys(pendingErrorsRef.current.errors).map(k => [k, true])
                        )
                        : {}
                }
                enableReinitialize
                validate={(values) => handleValidation(values, schemas[index], struct.steps[index])}
                onSubmit={async (values, helpers) => {
                    helpers.setStatus(undefined);
                    if (useBackend) await handleBackendSubmit(values, helpers);
                    else            await handleFrontendSubmit(values, helpers);
                }}
            >
                {(formik) => {
                    if (
                        pendingErrorsRef.current?.stepIndex === index &&
                        Object.keys(formik.errors).length > 0
                    ) {
                        pendingErrorsRef.current = null;
                    }

                    const wizard = {
                        ...ctx,
                        ...formik,
                        currentStep: struct.steps[index],
                        isFirstStep: index === 0,
                        isLastStep:  index === struct.steps.length - 1,
                    };

                    return (
                        <Form>
                            {typeof children === "function" ? children(wizard) : children}
                        </Form>
                    );
                }}
            </Formik>
        </>
    );
};

export const Wizard = ({ struct, path, children }) => {
    const navigate = useNavigate();

    return (
        <WizardProvider key={struct.id} struct={struct} path={path}>
            <WizardInner struct={struct} navigate={navigate}>
                {children}
            </WizardInner>
        </WizardProvider>
    );
};

Wizard.Step          = WizardStep;
Wizard.Header        = WizardHeader;
Wizard.Stepper       = WizardStepper;
Wizard.Fields        = WizardFields;
Wizard.Field         = WizardField;
Wizard.Buttons       = WizardButtons;
Wizard.Button        = WizardButton;
Wizard.NextButton    = WizardNextButton;
Wizard.BackButton    = WizardBackButton;
Wizard.SubmitButton  = WizardSubmitButton;
Wizard.GoHomeButton  = WizardGoHomeButton;
Wizard.Status        = WizardStatus;
Wizard.Animated      = WizardAnimated;

const useWizard = () => useContext(wizardContext);
export default useWizard;