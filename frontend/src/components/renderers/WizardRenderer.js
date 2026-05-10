import { useNavigate, Route, Routes } from 'react-router-dom';
import { Formik, Form } from "formik";
import { motion, AnimatePresence } from "framer-motion";

import { handleDelay, handleValidation, handleData } from "utils/handlers";

import useWizard, { WizardProvider } from "context/wizardContext";
import WizardStep from "components/renderers/WizardStep";
import WizardButtons from "components/renderers/WizardButtons";

import FormContainer from "components/containers/FormContainer";

export const WizardRenderer = () => {
    const navigate = useNavigate();
    const wizardContext = useWizard();
    const { struct, schemas, getFormData, setFields, index, initialValues, nextStep, ADELANTE, direction, length } = wizardContext;

    // esto es para la animacion nada mas
    const duration = 0.15;
    const variants = {
        enter: (dir) => ({ x: dir === ADELANTE ? 100 : -100, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir === ADELANTE ? -100 : 100, opacity: 0 }),
    };

    return (
        <FormContainer>
            <Formik
                initialValues={initialValues}
                enableReinitialize={true}
                validate={(values) => handleValidation(values, schemas[index], struct.steps[index])}
                validationOnBlur={true}
                onSubmit={async (values, formikHelpers) => {
                    setFields(values);
                    formikHelpers.setStatus(undefined);
                    
                    // console.log("FORMDATA:",getFormData());

                    await handleDelay(500);
                    if (index === (struct.steps?.length - 1)) {
                        await struct.onSubmit({
                            formData:handleData(getFormData()),
                            navigate,
                            ...wizardContext,
                            ...formikHelpers,
                        });
                    } else {
                        nextStep();
                        // setSubmitting(false);
                    }
                }}
            >
                    <Form>
                        <AnimatePresence
                            mode="wait"
                            custom={direction}
                        >
                            <motion.div
                                key={index}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration }}
                                className="d-flex fit-flex justify-content-center"
                            >
                                <WizardStep
                                    index={index}
                                    length={length}
                                    struct={struct}
                                />
                            </motion.div>
                        </AnimatePresence>
                        <WizardButtons
                            index={index}
                            length={length}
                            struct={struct}
                        />
                    </Form>
            </Formik>
        </FormContainer>
    );
};

export const WizardRouter = (struct, path) => (
    <Routes>
        <Route
            path="*"
            element={
                <WizardProvider
                    key={struct.id}
                    struct={struct}
                    path={path}
                >
                    <WizardRenderer />
                </WizardProvider>
            }
        >
            {struct.steps.map((step, i) => (
                <Route key={i} path={step.path} element={<></>}/>
            ))}
        </Route>
    </Routes>
);