import Span from "components/Span";
import FieldWrapper from "components/subComponents/FieldWrapper";

const SelectableCard = ({
    id,
    name,

    title,
    description,
    label,

    checked = false,

    onChange,
    onBlur,

    required = false,
    alwaysActive = false,

    textHelp,
    className = "",

    errors = {},
    touched = {},
    ...props
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
                const isActive = alwaysActive || checked;

                const handleClick = () => {
                    if (alwaysActive) return;

                    onChange?.({
                        target: {
                            name,
                            checked: !checked,
                            type: "checkbox",
                        },
                    });
                };

                return (
                    <>
                        {!alwaysActive && (
                            <input
                                className="d-none"
                                id={id || name}
                                type="checkbox"
                                name={name}
                                checked={checked}
                                onChange={onChange}
                                onBlur={onBlur}
                                required={required}
                                {...props}
                            />
                        )}

                        {label && (
                            <label
                                htmlFor={id || name}
                                className={`
                                    form-check-label
                                    d-block
                                    mb-1
                                    ${hasError ? "text-danger" : ""}
                                `}
                            >
                                <Span>
                                    {label}

                                    {required && (
                                        <Span className="text-danger">
                                            *
                                        </Span>
                                    )}
                                </Span>
                            </label>
                        )}

                        <div
                            role="checkbox"
                            aria-checked={isActive}
                            aria-disabled={alwaysActive}
                            tabIndex={alwaysActive ? -1 : 0}
                            onClick={handleClick}
                            onKeyDown={(e) => {
                                if (
                                    e.key === "Enter" ||
                                    e.key === " "
                                ) {
                                    e.preventDefault();
                                    handleClick();
                                }
                            }}
                            className={`
                                w-100
                                border
                                rounded-1
                                p-3
                                transition
                                user-select-none
                                ${
                                    isActive
                                        ? "border-primary-color bg-primary bg-opacity-10"
                                        : "border-secondary-subtle bg-body bg-opacity-50"
                                }
                                ${
                                    hasError
                                        ? "border-danger"
                                        : ""
                                }
                                ${className}
                            `}
                            style={{
                                cursor: alwaysActive
                                    ? "default"
                                    : "pointer",
                            }}
                        >
                            <div className="d-flex flex-column gap-1">
                                <Span className="fw-semibold">
                                    {title}
                                </Span>

                                {description && (
                                    <Span className="small text-body-secondary">
                                        {description}
                                    </Span>
                                )}
                            </div>
                        </div>
                    </>
                );
            }}
        </FieldWrapper>
    );
};

export default SelectableCard;