import useWizard from "context/wizardContext";

const WizardButton = ({
    type = "button",
    onClick,
    text,
    children,
    className = "btn btn-primary",
    disabled = false,
    loading = false,
    ...props
}) => {
    const wizard = useWizard();
    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            className={`text-nowrap position-relative ${className}`}
            onClick={(e) => onClick?.({ e, ...wizard })}
            disabled={isDisabled}
            {...props}
        >
            <span style={{ opacity: isDisabled ? 0 : 1 }}>
                {children ?? text ?? "Button"}
            </span>

            {loading && (
                <div className="d-flex position-absolute">
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
    );
};

export default WizardButton;
