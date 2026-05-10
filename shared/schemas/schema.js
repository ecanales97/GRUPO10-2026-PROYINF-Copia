import { z } from "zod";

export const parseMoneyString = (value) => (value) && value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const parseMoneyStringMoney = (value) => (value) && '$ ' + parseMoneyString(value);

const cleanNumber = (val) => {
    if (typeof val === "string") {
        return val.replace(/[^\d.-]/g, "");
    }
    return val;
};

// HELPERS
const getToday = () => new Date();

const getFirstPaymentDates = (minMonths = 1, maxMonths = 3) => {
    const today = getToday();

    const minDate = new Date(
        today.getFullYear(),
        today.getMonth() + minMonths,
        today.getDate()
    );

    const maxDate = new Date(
        today.getFullYear(),
        today.getMonth() + maxMonths,
        today.getDate()
    );

    const minDateFixed = new Date(minDate);
    minDateFixed.setDate(minDate.getDate() - 1);

    return { minDate, maxDate, minDateFixed };
};

// VALIDATIONS
export const validations = {
    nationalId: () =>
        z.union([
            z.string().regex(
                /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]{1}$/,
                "Formato de Rut invalido."
            ),
            z.literal("")
        ]).optional(),

    nationalIdRequired: () =>
        z.string()
            .min(1, "El Rut es obligatorio.")
            .regex(
                /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]{1}$/,
                "Formato de Rut invalido."
            ),
    
    name: () =>
        z.string()
            .min(1, "Tu nombre completo es obligatorio.")
            .max(250, "El nombre es demasiado largo."),

    nickname: () =>
        z.string()
            .min(1, "El apodo es obligatorio.")
            .max(25, "El apodo es demasiado largo."),
    
    phone: () => 
        z.string()
            .transform((val) => val.replace(/\s|-/g, ""))
            .refine((val) => {
                return /^\+?[0-9]{8,15}$/.test(val);
            }, {
                message: "Número de teléfono inválido"
            }),

    email: () =>
        z.string()
            .min(1, "El correo es obligatorio.")
            .email("Correo inválido."),

    password: () =>
        z.string()
            .min(6, "La contraseña debe tener al menos 6 caracteres.")
            .max(32, "La contraseña es demasiado larga."),

    confirmPassword: () =>
        z.string()
            .min(1, "Debes confirmar la contraseña."),

    passwordRequired: () =>
        z.string()
            .min(1, "Debes ingresar tu contraseña."),
    
    amount: ({ min, max } = {}) =>
        z.preprocess(
            cleanNumber,
            [
                min !== undefined &&
                    ((schema) =>
                        schema.min(
                            min,
                            `Ingresa un monto superior a ${parseMoneyStringMoney(min)}.`
                        )),

                max !== undefined &&
                    ((schema) =>
                        schema.max(
                            max,
                            `Ingresa un monto inferior a ${parseMoneyStringMoney(max)}.`
                        )),
            ]
                .filter(Boolean)
                .reduce(
                    (schema, fn) =>
                        fn(schema),
                    z.coerce.number({
                        required_error: "Debes ingresar un monto.",
                        invalid_type_error: "El monto no es valido.",
                    })
                )
        ),

    income: () =>
        z.preprocess(
            cleanNumber,
            z.coerce.number({
                required_error: "Debes ingresar tu renta.",
                invalid_type_error: "La renta no es valida.",
            })
                .min(0, "Debes ingresar tu renta."),
        ),

    termMonthly: ({ min , max } = {}) =>
        z.preprocess(
            cleanNumber,
            z.coerce.number({
                required_error: "Debes ingresar un plazo.",
                invalid_type_error: "El plazo no es valido.",
            })
                .min(min, `Ingresa un plazo mayor a ${min} meses.`)
                .max(max, `Ingresa un plazo menor a ${max} meses.`),
        ),
    
    termYears: ({ min, max } = {}) => 
        z.preprocess(
            cleanNumber,
            z.coerce.number({
                required_error: "Debes ingresar un plazo.",
                invalid_type_error: "El plazo no es valido.",
            })
                .min(min, `Ingresa un plazo mayor a ${min} años.`)
                .max(max, `Ingresa un plazo menor a ${max} años.`),
        ),

    firstPaymentDate: ({ min, max } = {}) => {
        const { minDate, maxDate, minDateFixed } = getFirstPaymentDates(min, max);

        return z.string({
            required_error: "Debes ingresar una fecha.",
        })
            .refine((val) => !isNaN(new Date(val).getTime()), {
                message: "La fecha no es válida.",
            })
            .transform((val) => {
                const [year, month, day] = val.split("-").map(Number);
                return new Date(year, month - 1, day);
            })
            .refine((date) => date >= minDateFixed, {
                message: `El primer pago debe ser desde ${minDate.toLocaleDateString()}`,
            })
            .refine((date) => date <= maxDate, {
                message: `El primer pago debe ser antes de ${maxDate.toLocaleDateString()}`,
            });
    },

    propertyValue: ({ min, max } = {}) =>
        z.preprocess(
            cleanNumber,
            [
                min !== undefined &&
                    ((schema) =>
                        schema.min(
                            min,
                            `Ingresa un monto superior a ${parseMoneyStringMoney(min)}.`
                        )),

                max !== undefined &&
                    ((schema) =>
                        schema.max(
                            max,
                            `Ingresa un monto inferior a ${parseMoneyStringMoney(max)}.`
                        )),
            ]
                .filter(Boolean)
                .reduce(
                    (schema, fn) =>
                        fn(schema),
                    z.coerce.number({
                        required_error: "Debes ingresar un monto.",
                        invalid_type_error: "El monto no es valido.",
                    })
                )
        ),
    
    propertyType: () =>
        z.string()
            .min(1, "Debes seleccionar un tipo de propiedad."),
    
    rateType: () =>
        z.string()
            .min(1, "Debes seleccionar un tipo de tasa."),
    
    downPayment: ({ min, max } = {}) =>
        z.preprocess(
            cleanNumber,
            [
                min !== undefined &&
                    ((schema) =>
                        schema.min(
                            min,
                            `Ingresa un monto superior a ${parseMoneyStringMoney(min)}.`
                        )),

                max !== undefined &&
                    ((schema) =>
                        schema.max(
                            max,
                            `Ingresa un monto inferior a ${parseMoneyStringMoney(max)}.`
                        )),
            ]
                .filter(Boolean)
                .reduce(
                    (schema, fn) =>
                        fn(schema),
                    z.coerce.number({
                        required_error: "Debes ingresar un monto.",
                        invalid_type_error: "El monto no es valido.",
                    })
                )
        ),
    
    useSimplePersonalInformation: () =>
        z.boolean(),
    
    birthDate: () =>
        z.string({
            required_error: "La fecha de nacimiento es obligatoria",
        })
        .nonempty("La fecha de nacimiento es obligatoria")
        .refine((value) => !isNaN(new Date(value).getTime()), {
            message: "Fecha inválida",
        })
        .refine((value) => {
            const today = new Date();
            const birth = new Date(value);

            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();

            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                age--;
            }

            return age >= 18;
        }, {
            message: "Debes ser mayor de 18 años",
        }),
    
    maritalStatus: () =>
        z.string()
            .min(1, "Debes seleccionar tu estado civil."),
    
    jobs: () =>
        z.string()
            .min(1, "Debes seleccionar tu tipo de trabajo."),

    salary: () =>
        z.preprocess(
            cleanNumber,
            z.coerce.number({
                required_error: "Debes ingresar tu sueldo.",
                invalid_type_error: "El sueldo no es válido.",
            })
            .min(1, "Debes ingresar tu sueldo."),
        ),

    jobStartDate: () =>
        z.string({
            required_error: "Debes ingresar la fecha de inicio laboral.",
        })
        .nonempty("Debes ingresar la fecha de inicio laboral.")
        .refine((val) => !isNaN(new Date(val).getTime()), {
            message: "Fecha inválida.",
        })
        .refine((val) => {
            const date = new Date(val);
            const today = new Date();
            return date <= today;
        }, {
            message: "La fecha no puede ser futura.",
        }),
    
    assetType: () =>
        z.string()
            .min(1, "Debes seleccionar un tipo de activo."),
    
    assetValue: () =>
        z.preprocess(
            cleanNumber,
            z.coerce.number({
                required_error: "Debes ingresar el valor del activo.",
                invalid_type_error: "El valor no es válido.",
            })
            .min(1, "Debes ingresar un valor válido."),
        ),
};

export const objectValidations = {
    registerConfirmPassword: () => (schema) =>
        schema.refine(
            ({ password, confirmPassword }) => password === confirmPassword,
            {
                message: "Las contraseñas no coinciden.",
                path: ["confirmPassword"]
            }
        ),
    useSimplePersonalInformation: () => (schema) =>
        schema.refine(
            ({ nationalId, useSimplePersonalInformation }) =>
                nationalId === ""
                    ? true
                    : useSimplePersonalInformation,
            {
                message: "Debes confirmar el uso de información personal.",
                path: ["useSimplePersonalInformation"]
            }
        ),
    downPayment: ({ min, max }) => (schema) =>
        schema.refine(
            ({ itemValue, downPayment }) => {
                const percentage = downPayment / itemValue;

                return percentage >= min && percentage <= max;
            },
            {
                message: `El pie debe estar entre ${Math.round(min * 100)}% y ${Math.round(max * 100)}% del valor de la propiedad.`,
                path: ["downPayment"]
            }
        )
}

const today = getToday();

const getFirstPaymentDate = (firstPaymentMonths) => new Date(
    today.getFullYear(),
    today.getMonth() + firstPaymentMonths,
    today.getDate()
);
// DEFAULTS
export const defaultData = {
    firstPaymentDate: ({firstPaymentMonths}) => getFirstPaymentDate(firstPaymentMonths).toISOString().split("T")[0],
};