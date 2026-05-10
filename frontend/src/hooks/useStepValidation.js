import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleData, handleCurrentValues } from "utils/handlers";

export const ADELANTE = "forward";
export const ATRAS = "backward";

const getCurrentPath = (location, basePath) => location.pathname.startsWith(basePath) ? location.pathname.slice(basePath.length).replace(/^\//, "") : "";
const getCurrentIndex = (steps, currPath) => steps.findIndex(step => (step.path || "") === currPath);
// const getPath = (path) => path || ".";

const buildPath = (basePath, path = "") => {
    const base = basePath.replace(/\/+$/g, "");
    const p = (path || "").replace(/^\/+/g, "");
    return `${base}/${p}`.replace(/\/+/g, "/");
};

/**
 * UPDATE: ya no es necesario el mainPath, solo se
 * navega usando { relative: "route" }.
 * 
 * hook que valida los pasos previos de un wizard multistep form.
 * 
 * mas reutilizable :)
 * 
 * - `steps` - array con los paths de los steps.
 * - `schemas` - array con los schemas de cada paso del formulario.
 * - `basePath` - path base del formulario.
 * - `getFormData` - para obtener la data del formulario.
 * - `hasSavedData` - funcion para saber si hay o no un formData
 * guardado en la sesion.
 */
const useStepValidation = ({
    steps,
    schemas,
    basePath,
    getFormData,
    hasSavedData
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [ direction, setDirection ] = useState("");

    const currPath = getCurrentPath(location, basePath);
    const currIndex = getCurrentIndex(steps,currPath);

    const goStep = useCallback((index) => {
        if (index < 0 || index >= steps.length) return;

        if (index > currIndex)  setDirection(ADELANTE);
        else if (index < currIndex) setDirection(ATRAS);

        const p = steps[index].path;
        if (p) {
            navigate(buildPath(basePath, p));
            return;
        }
        navigate(basePath);
    },[navigate, currIndex, steps, basePath]);

    const nextStep = () => goStep(currIndex + 1);

    const prevStep = () => goStep(currIndex - 1);

    useEffect(() => {
        // no valida si te mueves para atras
        // if (direction === ATRAS) return;
        // comentado porque generaba errores xd

        // si estas donde no deberias, te manda para el step 0
        // si recien se carga el forumlario (direction === "")
        // entonces tambien te manda al step 0
        if (!hasSavedData() && (currIndex === -1 || (direction === "" && currIndex !== 0))) {
            goStep(0);
            return;
        }

        // para rederigir a la parte del formulario
        // que no esta completo
        let newIndex = currIndex;
        let prevHadSchema = true;
        const check = steps.length < (currIndex + 1) ? steps.length : currIndex + 1;
        const fixedFormData = handleData(getFormData());
        for (let i = 0; i < check; i++) {
            if ((Object.keys(schemas[i].shape).length === 0) && prevHadSchema) {
                prevHadSchema = false;
                newIndex = i;
                continue;
            }

            prevHadSchema = true;
            const stepData = handleCurrentValues(fixedFormData, steps[i]);
            const res = schemas[i].safeParse(stepData);

            if (!res.success) {
                newIndex = i;
                break;
            }
        }

        // solo deberia redirigirte si estas en un index
        // mayor al que te quiere redirigir
        // No deberia redirigir si el paso incompleto es
        // mayor o igual al que esta actualmente
        if (currIndex > newIndex) {
            setDirection(ATRAS);
            goStep(newIndex);
        }

    }, [getFormData, schemas, steps, basePath, goStep, currIndex, direction, hasSavedData]);

    return { nextStep, prevStep, goStep, currIndex, direction };
};

export default useStepValidation;