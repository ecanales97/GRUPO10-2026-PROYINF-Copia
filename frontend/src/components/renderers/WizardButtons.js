import { memo } from "react";
import { useNavigate } from 'react-router-dom';
import { useFormikContext } from "formik";

import { ArrowRight, ArrowLeft } from 'lucide-react';

import useWizard from "context/wizardContext";

import BtnsContainer from "components/containers/BtnsContainer";
import Span from "components/Span";

import TEXT from "config/texts";

const WizardButtons = memo(({index, length, struct}) => {
    const navigate = useNavigate();
    const { prevStep } = useWizard();
    const { isSubmitting } = useFormikContext();

    const topButtons = struct.steps[index].topButtons ?? [];
    const bottomButtons = struct.steps[index].bottomButtons ?? [];
    const submitText = struct.submitButtonText;
    const continueText = struct.steps[index].continueButtonText;
    const backText = struct.steps[index].backButtonText;
    const goHomeText = struct.steps[index].goHomeButtonText;

    // console.log("RENDERIZANDO BOTONES");

    const ContinueButton = {
        text: continueText ?? (
            <Span>
                {TEXT.form.buttons.continue}
                <ArrowRight size={"1rem"} />
            </Span>
        ),
        type: "submit",
    };
    const BackButton = {
        text: backText ?? (
            <Span>
                <ArrowLeft size={"1rem"} />
                {TEXT.form.buttons.back}
            </Span>
        ),
        type: "button",
        onClick: prevStep,
        className: "btn btn-secondary btn-opacity-25",
    };
    const GoHomeButton = {
        text: goHomeText ?? (
            <Span>
                <ArrowLeft size={"1rem"} />
                {TEXT.form.buttons.goHome}
            </Span>
        ),
        type: "button",
        onClick: () => navigate("/"),
        className: "btn btn-secondary btn-opacity-25",
    }
    const SubmitButton = {
        text: submitText ?? (
            <Span>
                {TEXT.form.buttons.submit}
            </Span>
        ),
        type: "submit",
    };

    let buttons = [...topButtons];
    if (index === length - 1) {
        buttons.push(SubmitButton);
        if (length !== 1 ) buttons.push(BackButton);
    } else if (index === 0) {
        buttons.push(ContinueButton);
    } else {
        buttons.push(ContinueButton);
        buttons.push(BackButton);
    }

    if (index === 0) {
        buttons.push(GoHomeButton);
    }

    buttons = [...buttons, ...bottomButtons];

    return (
        <BtnsContainer
            bottomPosition={false}
        >
            { buttons.map((data, index) => {
                const cn = data.className ?? "btn btn-primary";

                const isDisabled = (data.type === "submit" && isSubmitting);

                return (
                    <button
                        key={index}
                        type={data.type ?? "button"}
                        className={`position-relative ${cn}`}
                        onClick={(e) => {
                            data.onClick?.({ e, navigate })
                        }}
                        disabled={isDisabled}
                    >
                        <span style={{ opacity: isDisabled ? 0 : 1 }}>
                            {data.text ?? "Button"}
                        </span>
                        {isDisabled && (
                            <div
                                className="d-flex position-absolute"
                            >
                                <div
                                    className="spinner-border spinner-border-sm"
                                    style={{ width: "1.5rem", height: "1.5rem" }}
                                    role="status"
                                >
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}
                    </button>
                )
            }) }
        </BtnsContainer>
    );
});

export default WizardButtons;