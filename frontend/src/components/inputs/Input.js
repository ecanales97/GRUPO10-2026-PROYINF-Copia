import FieldWrapper from "components/subComponents/FieldWrapper";

/**
 * input para un formulario.
 * 
 * - retorna el input.
*/
const Input = ({
    id,
    name,
    label,
    required = false,
    maxLength,
    placeholder = "",
    type = "text",
    textHelp,
    min,
    max,
    value,
    onChange,
    onBlur,
    className = "",
    errors = {},
    touched = {},
    ...props
}) => {
    return (
        <FieldWrapper
            id={id}
            name={name}
            label={label}
            textHelp={textHelp}
            required={required}
            errors={errors}
            touched={touched}
        >
            {({ hasError }) => (
                <input
                    id={id || name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    className={`input-form form-control bg-body bg-opacity-50 ${
                        hasError ? "is-invalid" : ""
                    } ${className}`}
                    maxLength={maxLength}
                    min={min}
                    max={max}
                    required={required}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    {...props}
                />
            )}
        </FieldWrapper>
    );
};

export default Input;