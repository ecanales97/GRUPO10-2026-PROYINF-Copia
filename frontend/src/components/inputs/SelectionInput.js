import Span from "components/Span";
import FieldWrapper from "components/subComponents/FieldWrapper";

/**
 * para checkbox y switches
 * 
 * type = "checkbox" o "switch"
 * por defecto es checkbox
 */
const SelectionInput = ({
    type = "checkbox",
    id,
    name,
    label,
    checked,
    onChange,
    onBlur,
    required = false,
    textHelp,
    className = "",
    errors = {},
    touched = {},
}) => {
    return (
        <FieldWrapper
            id={id}
            name={name}
            textHelp={textHelp}
            required={false}
            errors={errors}
            touched={touched}
        >
            {({ hasError }) => {
                const isSwitch = type === "switch";

                return (
                <div className={`form-check ${isSwitch ? "form-switch" : ""}`}>
                    <input
                        id={id || name}
                        type="checkbox"
                        name={name}
                        className={`form-check-input ${
                            hasError ? "is-invalid" : ""
                        } ${className} ${checked ? "" : "bg-body bg-opacity-50"}`}
                        checked={checked}
                        onChange={onChange}
                        onBlur={onBlur}
                        required={required}
                    />

                    <label
                        htmlFor={id || name}
                        className={`form-check-label ${
                            hasError ? "text-danger" : ""
                        }`}
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
                </div>
                );
            }}
        </FieldWrapper>
    );
};

export default SelectionInput;