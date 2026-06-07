import { useRef, useState, useCallback, useEffect } from "react";
import { CloudUpload, File, X } from "lucide-react";
import FieldWrapper from "components/subComponents/FieldWrapper";

const fmtBytes = (b) =>
    b < 1024 ? `${b} B`
    : b < 1_048_576 ? `${(b / 1024).toFixed(1)} KB`
    : `${(b / 1_048_576).toFixed(1)} MB`;

const FileInput = ({
    id,
    name,
    label,
    value = null,
    required = false,
    textHelp,
    accept,
    multiple = false,
    onChange,
    onBlur,
    className = "",
    errors = {},
    touched = {},
    ...props
}) => {
    const inputRef = useRef(null);
    const isExternalUpdate = useRef(false);

    const [files, setFiles] = useState(() => {
        if (!value) return [];
        return Array.isArray(value) ? value : [value];
    });
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (isExternalUpdate.current) {
            isExternalUpdate.current = false;
            return;
        }
        setFiles(!value ? [] : Array.isArray(value) ? value : [value]);
    }, [value]);

    const notifyChange = useCallback(
        (newFiles) => {
            if (!onChange) return;
            onChange(multiple ? newFiles : newFiles[0] ?? null);
        },
        [onChange, multiple]
    );

    const mergeFiles = useCallback(
        (incoming) => {
            const list = Array.from(incoming);
            isExternalUpdate.current = true;
            if (!multiple) {
                const next = list.slice(0, 1);
                setFiles(next);
                notifyChange(next);
                return;
            }
            setFiles((prev) => {
                const merged = [
                    ...prev,
                    ...list.filter((f) =>
                        !prev.some((p) => p.name === f.name && p.size === f.size)
                    ),
                ];
                notifyChange(merged);
                return merged;
            });
        },
        [multiple, notifyChange]
    );

    const removeFile = (index) => {
        isExternalUpdate.current = true;
        setFiles((prev) => {
            const next = prev.filter((_, i) => i !== index);
            notifyChange(next);
            return next;
        });
    };

    const handleClick = () => inputRef.current?.click();

    const handleInputChange = (e) => {
        if (e.target.files?.length) mergeFiles(e.target.files);
        e.target.value = "";
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.length) mergeFiles(e.dataTransfer.files);
    };

    const hasFile = files.length > 0;

    const dropZoneContent = (hasError) => {
        const color = isDragging ? "primary" : hasError ? "danger" : "primary";

        if (!multiple && hasFile) {
            const f = files[0];
            return (
                <div className="d-flex flex-column align-items-center justify-content-center gap-2 text-center flex-grow-1 rounded-3 p-4">
                    {isDragging
                        ? <CloudUpload size={36} className="text-primary" />
                        : <File size={32} className={`text-${color}`} />
                    }
                    <span className="fw-semibold text-truncate w-100 text-center">
                        {isDragging ? "Suelta aquí" : f.name}
                    </span>
                    <small className="text-center text-muted">{fmtBytes(f.size)}</small>
                    <small className="text-center text-muted">Click o arrastra para reemplazar</small>
                    <button
                        type="button"
                        className={`btn btn-sm btn-outline-${color}`}
                        style={{
                            width: 28,
                            height: 28,
                            padding: 0,
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            removeFile(0);
                        }}
                        aria-label="Eliminar archivo"
                    >
                        <X size={14} />
                    </button>
                </div>
            );
        }

        return (
            <div className="d-flex flex-column align-items-center justify-content-center gap-2 text-centera flex-grow-1 rounded-3 p-4">
                <CloudUpload size={36} className={isDragging ? "text-primary" : "text-muted"} />
                <span className="text-center text-muted fw-medium">
                    {isDragging ? "Suelta aquí" : "Arrastra un archivo o haz click para seleccionar"}
                </span>
                {accept && <small className="text-center text-muted">Formatos: {accept}</small>}
            </div>
        );
    };

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
                <>
                    <input
                        ref={inputRef}
                        id={id || name}
                        name={name}
                        type="file"
                        accept={accept}
                        multiple={multiple}
                        className="visually-hidden"
                        onChange={handleInputChange}
                        onBlur={onBlur}
                        {...props}
                    />

                    <div
                        role="button"
                        tabIndex={0}
                        style={{ cursor: "pointer", minHeight: 300, position: "relative" }}
                        className={[
                            "file-dropzone border rounded-3",
                            "d-flex",
                            isDragging
                                ? "border-primary bg-primary bg-opacity-10"
                                : hasError
                                    ? "border-danger bg-danger bg-opacity-5"
                                    : hasFile && !multiple
                                        ? "border-primary bg-primary bg-opacity-5"
                                        : "border-primary border-opacity-35",
                            className,
                        ].filter(Boolean).join(" ")}
                        onClick={handleClick}
                        onKeyDown={(e) => e.key === "Enter" && handleClick()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {dropZoneContent(hasError)}
                    </div>

                    {multiple && hasFile && (
                        <ul className="list-unstyled mt-2 d-flex flex-column gap-2 mb-0">
                            {files.map((f, i) => (
                                <li
                                    key={`${f.name}-${f.size}-${i}`}
                                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-2 bg-body-secondary border"
                                >
                                    <File size={16} className="text-primary" />
                                    <span className="flex-grow-1 fw-medium text-truncate small">
                                        {f.name}
                                    </span>
                                    <span className="text-muted" style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                                        {fmtBytes(f.size)}
                                    </span>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-link text-muted p-0 lh-1"
                                        onClick={() => removeFile(i)}
                                        aria-label={`Eliminar ${f.name}`}
                                    >
                                        <X size={14} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </FieldWrapper>
    );
};

export default FileInput;