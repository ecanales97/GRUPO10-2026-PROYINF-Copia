import { Route, Routes } from "react-router-dom";

import useWizard, { Wizard, } from "context/wizardContext";

import FormContainer from "components/containers/FormContainer";
import BtnsContainer from "components/containers/BtnsContainer";

export const WizardRenderer = ({struct}) => {
    const wizard = useWizard();

    const {
        index,
        length,
        direction,
    } = wizard;

    return (
        <FormContainer className="overflow-hidden">
            <Wizard.Animated
                index={index}
                direction={direction}
            >
                <Wizard.Step
                    index={index}
                    length={length}
                    struct={struct}
                />
            </Wizard.Animated>
            <BtnsContainer bottomPosition={false}>
                <Wizard.Buttons
                    index={index}
                    length={length}
                    struct={struct}
                />
            </BtnsContainer>
        </FormContainer>
    );
};

export const WizardRouter = (struct, path) => {
    const useRouting = struct.useRouting ?? true;

    if (!useRouting) {
        return (
            <Wizard
                struct={struct}
                path={path}
            >
                <WizardRenderer struct={struct}/>
            </Wizard>
        );
    }

    return (
        <Routes>
            <Route
                path="*"
                element={
                    <Wizard
                        key={struct.id}
                        struct={struct}
                        path={path}
                    >
                        <WizardRenderer struct={struct}/>
                    </Wizard>
                }
            >
                {struct.steps.map((step, i) => (
                    <Route
                        key={i}
                        path={step.path}
                        element={<></>}
                    />
                ))}
            </Route>
        </Routes>
    );
};