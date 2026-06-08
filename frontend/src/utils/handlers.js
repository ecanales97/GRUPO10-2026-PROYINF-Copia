import { parseMoneyNumber, parseMoneyString, parseRut } from "utils/parsers";
import { backendUrl } from "./backend";

// solo para testeo
export const handleDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * con este se crea el key para los "otherField"
 */
export const handleOtherKey = (key) => `${key}_other`;

/**
 * para que los props opcionales no tengan valor "" o null
 * al darselo a un componente, de forma que no tome estos
 * valores y use el por default (si asi esta definido)
 */
export const handleOptionalProp = (key, value) => value != null && value !== "" ? { [key]: value } : {};

/**
 * valida los `values` con el `schema` de zod, para retornar errores.
 * 
 * - `values` - valores del formulario.
 * - `schema` - schema Zod para validar los datos.
 * - retorna los errores para usar con Formik.
 */
export const handleValidation = (values, schema, step) => {
    // let valuesFix = handleData(values);
    // const res = handleSchema(valuesFix, schema).safeParse(valuesFix);
    const data = handleData(values);
    const res = schema.safeParse(data);

    if (res.success) return {};

    const errors = {};
    for (const i of res.error.issues) {
        const path = i.path[0];
        const field = step.fields?.flat().find(field => field.name === path);

        if (field?.otherField) {
            const otherKey = handleOtherKey(path);
            if (values[path] === "0" || values[path] === 0) {
                errors[otherKey] = i.message;
                continue;
            } else {
                errors[path] = i.message
            }
        }
        else errors[path] = i.message;
    }
    return errors;
};


/**
 * transforma los `values` del formulario, usarlo antes de validar o enviar.
 * 
 * Lo principal es transformar los valores a los que corresponden y mueve
 * los keys tipo "key_other", al "key" que corresponde, para que su validacion
 * y envio (a backend por ejemplo) funcione correctamente.
 * 
 * - values - los datos a transformar.
 * - retorna los valores ya transformados.
 */
export const handleData = (values) => {
    const data = { ...values };

    Object.keys(values).forEach((key) => {
        const otherKey = handleOtherKey(key);
        if (otherKey in values) {
            if (data[key] === "0" || data[key] === 0) {
                data[key] = values[otherKey];
            }
            delete data[otherKey];
        }
    });
    return data;
};


/**
 * UPDATE: ahora usa el step hecho en el struct en vez de el schema
 * 
 * devuelve el initialValues / CurrentValues / formData del paso actual
 */
export const handleCurrentValues = (formData, step) => {
    const values = {};

    step.fields?.flat().forEach((field) => {
        values[field.name] = formData[field.name] ?? field.default ?? "";

        if (field.otherField) {
            const otherKey = handleOtherKey(field.name);
            values[otherKey] = formData[otherKey] ?? field.otherField.default ?? "";
        }
    });

    return values;
};



// HANDLERS DE CAMPOS/FIELDS

export const handleRut = ({ e, field, handleChange, setFieldValue }) => {
    handleChange(e);
    setFieldValue(field, parseRut(e.target.value));
};

export const handleFile = ({ e, field, handleChange, setFieldValue }) => {
    handleChange(e);
    const file = e.currentTarget.files?.[0];
    setFieldValue(field, file);
}

export const handleMoney = ({e, field, max = Number.MAX_SAFE_INTEGER, handleChange, setFieldValue, values}) => {
    handleChange(e);
    const input = e.target;
    const selectionStart = input.selectionStart;
    const value = parseMoneyNumber(input.value);
    // console.log("a",value);

    if (!value) {
        setFieldValue(field, "");
        return;
    }

    const newValue = parseMoneyString(value);
    let diff = newValue.length - (values[field] ? values[field].length : 0);

    if (value > max || value.length > max.toString().length) {
        setFieldValue(field, values[field]);
        diff = 0;
        // console.log("b",values[field]);
    } else {
        setFieldValue(field, newValue);
        // console.log("c",newValue);
    }

    requestAnimationFrame(() => {
        if (diff < 0) diff++;
        if (diff > 0) diff--;
        const newPos = Math.max(selectionStart + diff, 0);
        input.setSelectionRange(newPos, newPos);
    });
};

export const handleMoneyGeneral = ({e, field, handleChange, setFieldValue, values}) => {
    return handleMoney({e, field, handleChange, setFieldValue, values});
};

export const handleTerm = ({e, field, max, handleChange, setFieldValue, values}) => {
    handleChange(e);
    const value = e.target.value;
    if (value > max || value.length > max.toString().length)
        setFieldValue(field, values[field]);
    else setFieldValue(field, value);
};

export const handleCreditConfig = async (creditType = "") => {
    try {
        const url = `${backendUrl}/api/credits` + (creditType ? `/${creditType}` : "")
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) return null;

        const data = await res.json();
        return data || null;
    } catch (e) {
        console.error("Error al intentar obtener configuración de el/los credito(s):",e);
        return null;
    }
}
export const handlePathBuilders = (obj, parentPath = "") => {
    Object.values(obj).forEach((node) => {
        if (typeof node === "object" && node.path !== undefined) {

            const cleanParent = parentPath.replace(/^\/+|\/+$/g, "");
            const cleanPath = node.path.replace(/^\/+|\/+$/g, "");

            const fullPath = "/" + [cleanParent, cleanPath]
                .filter(Boolean)
                .join("/");

            node.fullPath = fullPath;

            node.build = (params = {}, query = {}) => {
                let path = fullPath;
                const matches = path.match(/:\w+/g);

                if (matches) {
                    matches.forEach((param) => {
                        const key = param.slice(1);

                        if (!(key in params)) {
                            throw new Error(`Falta param: ${key}`);
                        }

                        const value = params[key];

                        if (value === undefined || value === null) {
                            throw new Error(`Param inválido: ${key}`);
                        }

                        path = path.replace(param, encodeURIComponent(value));
                    });
                }

                const queryEntries = Object.entries(query)
                    .filter(([_, value]) => value !== undefined && value !== null);

                if (queryEntries.length > 0) {
                    const queryString = queryEntries
                        .flatMap(([key, value]) => {
                            if (Array.isArray(value)) {
                                return value.map(v =>
                                    `${encodeURIComponent(key)}=${encodeURIComponent(v)}`
                                );
                            }

                            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
                        })
                        .join("&");

                    path += `?${queryString}`;
                }

                return path;
            };

            handlePathBuilders(node, fullPath);
        }
    });
};