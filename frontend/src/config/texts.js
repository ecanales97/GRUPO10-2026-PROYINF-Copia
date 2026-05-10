import { parseMoneyString, parseMoneyStringMoney } from "utils/parsers";

const TEXT_FIELDS = {
    nationalId: () => ({
        label: "Rut",
        placeholder: "11.111.111-1",
        textHelp: "Ingresar tu Rut es opcional.",
    }),

    nationalIdRequired: () => ({
        label: "Rut",
        placeholder: "11.111.111-1",
        textHelp: "",
    }),

    name: () => ({
        label: "Nombre completo",
        placeholder: "Juan Perez",
        textHelp: "Ingresa tu nombre y apellido.",
    }),

    nickname: () => ({
        label: "Apodo",
        placeholder: "Juan",
        textHelp: "Sera como nos referiremos a ti. No es necesario que sea formal.",
    }),

    phone: () => ({
        label: "Telefono",
        placeholder: "+56912345678",
        textHelp: "Telefono de contacto."
    }),

    email: () => ({
        label: "Correo",
        placeholder: "correo@ejemplo.com",
        textHelp: "Correo de contacto.",
    }),

    password: () => ({
        label: "Contraseña",
        placeholder: "••••••••",
        textHelp: "",
    }),

    confirmPassword: () => ({
        label: "Confirmar contraseña",
        placeholder: "••••••••",
        textHelp: "Debe ser igual a tu contraseña ingresada.",
    }),

    passwordRequired: () => ({
        label: "Contraseña",
        placeholder: "••••••••",
        textHelp: "",
    }),

    amount: ({ min, max }) => ({
        label: "Monto",
        placeholder: `${parseMoneyString(1_500_000)}`,
        textHelp: `El monto debe ser entre ${parseMoneyStringMoney(min)} y ${parseMoneyStringMoney(max)}`,
    }),

    income: () => ({
        label: "Renta",
        placeholder: "Selecciona tu renta",
        textHelp: "Rango aproximado de tu renta liquida mensual.",
        otherField: {
            placeholder: `${parseMoneyString(1_000_000)}`,
            textHelp: "Un aproximado de tu renta liquida mensual.",
        },
    }),

    termMonthly: ({ min, max }) => ({
        label: "Plazo",
        placeholder: "3",
        textHelp: `Ingrese un plazo entre ${min} y ${max} meses.`,
    }),

    firstPaymentDate: ({ min, max }) => ({
        label: "Primer pago",
        placeholder: "",
        textHelp: `Puedes elegir una fecha entre ${min} y ${max} meses desde hoy.`,
    }),

    propertyValue: ({ min, max }) => ({
        label: "Valor de la propiedad",
        placeholder: `${parseMoneyString(80_000_000)}`,
        textHelp: `Valor aproximado de la propiedad que deseas comprar. Este debe tener un valor entre ${parseMoneyStringMoney(min)} y ${parseMoneyStringMoney(max)}.`,
    }),

    propertyType: () => ({
        label: "Tipo de propiedad",
        placeholder: "Selecciona una opción",
        textHelp: "Indica si es casa o departamento.",
    }),

    downPayment: ({ min, max }) => ({
        label: "Pie",
        placeholder: `${parseMoneyString(10_000_000)}`,
        textHelp: `Monto que pagarás al contado. Debe estar entre el ${Math.round(min*100)}% y ${Math.round(max*100)}% del valor de la propiedad.`,
    }),

    termYears: ({ min, max }) => ({
        label: "Plazo (años)",
        placeholder: "20",
        textHelp: `El plazo debe estar entre ${min} y ${max} años.`,
    }),

    rateType: () => ({
        label: "Tipo de tasa",
        placeholder: "Selecciona una opción",
        textHelp: "Define cómo variará la tasa en el tiempo.",
    }),

    useSimplePersonalInformation: () => ({
        label: "Permitir el uso de mi información",
        textHelp: "Necesitamos tu información para entregarte una mejor simulación."
    }),

    birthDate: () => ({
        label: "Fecha de nacimiento",
        textHelp: "Debes ser mayor de edad para registrarte.",
    }),

    maritalStatus: () => ({
        label: "Estado civil",
        placeholder: "Selecciona tu estado civil",
        textHelp: "Selecciona tu estado civil actual.",
    }),

    nationalities: () => ({
        label: "Nacionalidad",
        placeholder: "Selecciona tu nacionalidad",
        textHelp: "Indica tu nacionalidad.",
    }),

    jobs: () => ({
        label: "Tipo de trabajo",
        placeholder: "Selecciona tu tipo de trabajo",
        textHelp: "Selecciona la opción que mejor describa tu situación laboral.",
    }),

    salary: () => ({
        label: "Sueldo",
        placeholder: `${parseMoneyString(800_000)}`,
        textHelp: "Ingresa tu sueldo líquido mensual.",
    }),

    jobStartDate: () => ({
        label: "Fecha de inicio laboral",
        placeholder: "",
        textHelp: "Desde cuándo trabajas en tu empleo actual.",
    }),

    assetType: () => ({
        label: "Tipo de activo",
        placeholder: "Selecciona un tipo de activo",
        textHelp: "Ejemplo: propiedad, vehículo, ahorro, etc.",
    }),

    assetValue: () => ({
        label: "Valor del activo",
        placeholder: `${parseMoneyString(10_000_000)}`,
        textHelp: "Valor aproximado del activo.",
    }),
};

const TEXT = {
    home: {
        title: "Obten tu crédito hoy",
        subtitle: [
            "Es fácil",
            "Sin compromisos",
        ]
    },

    fields: TEXT_FIELDS,

    form: {
        buttons: {
            continue: "Continuar",
            back: "Volver",
            goHome: "Volver al inicio",
            submit: "Enviar",
        }
    },

    login: {
        title: "Acceso",
        buttons: {
            submit: "Iniciar sesión",
        }
    },

    register: {
        title: "Crea tu cuenta",
        buttons: {
            submit: "Crear mi cuenta",
        },
    },

    simulator: {

    },

    consumption: {
        name: "Crédito de consumo",
    },

    mortgage: {
        name: "Crédito hipotecario",
    },
}

export default TEXT;