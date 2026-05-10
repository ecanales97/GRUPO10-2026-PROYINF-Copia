import { handlePathBuilders } from "utils/handlers";

const PATH = {
    index: {
        path: "",
        label: "Inicio",
    },

    about: {
        path: "sobre-el-proyecto",
        label: "Sobre el proyecto",
    },

    // este se va a borrar, es temporal
    scanner: {
        path: "escanear",
        label: "Herramienta OCR"
    },

    // este se movera
    history: {
        path: "historial",
        label: "Historial",
    },
    
    credits: {
        path: "creditos",
        label: "Creditos",

        credit: {
            path: ":creditType",
            label: "Credito",
            dynamic: true,
            
            simulator: {
                path: "simulador",
                label: "Simulador",
            },

            apply: {
                path: "solicitud",
                label: "Solicitud",
            },
        }
    },

    login: {
        path: "iniciar-sesion",
        label: "Iniciar sesion",
    },

    register: {
        path: "crear-cuenta",
        label: "Crear cuenta",
    },
};

handlePathBuilders(PATH);

export default PATH;