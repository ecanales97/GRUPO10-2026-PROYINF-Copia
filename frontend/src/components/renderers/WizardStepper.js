import { Fragment } from "react";

import useWizard from "context/wizardContext";
import { SurfaceRow } from "components/containers/Surface";

const WizardStepper = ({ index, length, struct }) => {
    const wizard = useWizard();
    const { goStep } = wizard;

    index ??= wizard.index;
    length ??= wizard.length;
    struct ??= wizard.struct;

    if (!struct.stepper) return null;

    return (
        <SurfaceRow className="align-items-center px-4 py-3 rounded-2">
            {struct.steps.map((step, indexStep) => (
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
                        {indexStep + 1}
                    </div>

                    {(indexStep + 1) !== length && (
                        <div className={`d-flex fit-flex bg-primary ${indexStep >= index ? "bg-opacity-25" : ""}`} style={{
                            height: "1px",
                        }} />
                    )}
                </Fragment>
            ))}
        </SurfaceRow>
    );
};

export default WizardStepper;
