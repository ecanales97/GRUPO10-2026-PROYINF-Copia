import FieldWrapper from "components/subComponents/FieldWrapper";

const RadioGroup = ({
  name,
  label,
  options = [],
  value,
  onChange,
  required = false,
  errors = {},
  touched = {},
}) => {
    return (
        <FieldWrapper
            name={name}
            label={label}
            required={required}
            errors={errors}
            touched={touched}
        >
            {({ hasError }) => (
                <div className="d-flex flex-column gap-2">
                    {options.map((opt) => (
                        <div key={opt.value} className="form-check">
                        <input
                            type="radio"
                            name={name}
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={onChange}
                            className={`form-check-input ${
                            hasError ? "is-invalid" : ""
                            }`}
                        />
                        <label className="form-check-label">
                            {opt.label}
                        </label>
                        </div>
                    ))}
                </div>
            )}
        </FieldWrapper>
    );
};

export default RadioGroup;