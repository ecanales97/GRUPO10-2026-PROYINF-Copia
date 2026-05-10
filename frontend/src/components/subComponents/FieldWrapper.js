import { ErrorMessage } from "formik";

import TextHelp from "components/subComponents/TextHelp";
import Span from "components/Span";

const FieldWrapper = ({
    children,
    id,
    name,
    label,
    textHelp,
    required,
    errors = {},
    touched = {},
}) => {
    const hasError = touched[name] && errors[name];

    return (
        <div className="d-flex flex-column">
            <div className="d-flex flex-column gap-1">
                {label && (
                    <label
                        htmlFor={id || name}
                        className={`form-label ${hasError ? "text-danger" : ""}`}
                    >
                        <Span>
                            {label}
                            {required && 
                                <Span className="text-danger">
                                    *
                                </Span>
                            }
                        </Span>
                    </label>
                )}
                
                {typeof children === "function"
                    ? children({ hasError })
                    : children}
            </div>
            {hasError ? (
                <ErrorMessage name={name}>
                    {(msg) => (
                        <div className="invalid-feedback d-block">{msg}</div>
                    )}
                </ErrorMessage>
            ) : (
                textHelp && (
                    <TextHelp id={id ?? ""} name={name ?? ""}>
                        {textHelp}
                    </TextHelp>
                )
            )}
        </div>
    );
};

export default FieldWrapper;