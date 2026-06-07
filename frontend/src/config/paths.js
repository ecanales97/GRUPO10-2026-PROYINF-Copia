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
        path: "escaner",
        label: "Escáner (TESTING)"
    },

    dashboard: {
        path: "panel",
        label: "Panel",
    },

    profile: {
        path: "perfil",
        label: "Perfil",
    },

    settings: {
        path: "configuracion",
        label: "Configuración",

        setting: {
            path: ":settingType",
            label: "Configuración",
            dynamic: true,
        },
    },

    declarations: {
        path: "declaraciones",
        label: "Declaraciones",
        
        declaration: {
            path: ":declarationType",
            label: "Declaración",
            dynamic: true,
        }
    },

    simulations: {
        path: "simulaciones",
        label: "Mis simulaciones",
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