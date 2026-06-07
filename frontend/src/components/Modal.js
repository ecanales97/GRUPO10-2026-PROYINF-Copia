import { X } from 'lucide-react';

const Modal = ({
    children,

    active,
    title,

    onClose,
    onConfirm,
    loading = false,

    confirmText = "Confirmar",
    cancelText = "Cancelar",

    header,
    hideHeader = false,
    footer,
    hideFooter = false,

    width = 500,
}) => {
    if (!active) {
        return null;
    }

    return (
        <div
            className="
                position-fixed
                top-0
                start-0
                w-100
                h-100
                d-flex
                align-items-center
                justify-content-center
            "
            style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 9999,
                padding: "1rem",
            }}
            onClick={onClose}
        >
            <div
                className="
                    bg-body
                    rounded-1
                    w-100
                    d-flex
                    flex-column

                    border
                    border-primary
                    border-opacity-25
                "
                style={{
                    maxWidth: width,
                    maxHeight: "100%",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {!hideHeader && <div
                    className="
                        d-flex
                        align-items-center
                        justify-content-between
                        p-4
                        border-bottom
                        border-primary
                        border-opacity-25
                    "
                >
                    {header ??
                        <h3 className="baskervville-regular m-0">
                            {title}
                        </h3>
                    }
                    <button
                        type="button"
                        className="btn btn-body w-fit p-2"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <X/>
                    </button>
                </div>}

                <div className="p-4 overflow-auto" style={{minHeight: 0}}>
                    {children}
                </div>

                {!hideFooter &&
                    <div
                        className="
                            d-flex
                            justify-content-end
                            gap-2
                            border-top
                            border-primary
                            border-opacity-25
                            p-3
                        "
                    >
                        {(footer ??
                            <>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-opacity-25"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    {cancelText}
                                </button>

                                <button
                                    type="button"
                                    className={`btn btn-primary`}
                                    onClick={onConfirm}
                                    disabled={loading}
                                >
                                    {
                                        loading
                                            ? "Cargando..."
                                            : confirmText
                                    }
                                </button>
                            </>
                        )}
                    </div>
                }
            </div>
        </div>
    );
};

export default Modal;