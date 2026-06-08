import { z } from "zod";

const VALID_FILE_TYPES = [
    "image/png",
    "image/jpeg",
    "application/pdf",
];

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

    return { minDate, maxDate };
};

export const zodSelectField = (options, messages = {}) => {
    const {
        required = "Debes seleccionar una opción.",
        invalid = "El valor seleccionado no es válido.",
    } = messages;

    return z.string()
        .min(1, required)
        .refine(
            (val) => !options?.length || options.some(opt => opt.value === val),
            invalid
        );
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

    income: ({ options } = {}) =>
        z.preprocess(
            cleanNumber,
            z.coerce.number({
                required_error: "Debes ingresar tu renta.",
                invalid_type_error: "La renta no es valida.",
            })
                .min(0, "Debes ingresar tu renta."),
            zodSelectField(options, { required: "Debes seleccionar un ingreso valido." }),
        ),

    monthlyIncome: () =>
        z.preprocess(
            cleanNumber,
            z.coerce.number({
                required_error: "Debes ingresar tu ingreso.",
                invalid_type_error: "El ingreso no es valido.",
            })
                .min(0, "Debes ingresar tu ingreso.")
        ),

    incomeType: ({ options } = {}) =>
        zodSelectField(options, { required: "Debes seleccionar un tipo de ingreso." }),

    isRecurring: () =>
        z.boolean(),

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
        const { minDate, maxDate } = getFirstPaymentDates(min, max);

        return z.string({
            required_error: "Debes ingresar una fecha.",
        })
            .refine((val) => !isNaN(new Date(val).getTime()), {
                message: "La fecha no es válida.",
            })
            .refine((val) => {
                const [year, month, day] = val.split("-").map(Number);
                return new Date(year, month - 1, day) >= minDate;
            }, {
                message: `El primer pago debe ser desde ${minDate.toLocaleDateString()}`,
            })
            .refine((val) => {
                const [year, month, day] = val.split("-").map(Number);
                return new Date(year, month - 1, day) <= maxDate;
            }, {
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
    
    propertyType: ({ options } = {}) =>
        zodSelectField(options),
    
    rateType: ({ options } = {}) =>
        zodSelectField(options, { required: "Debes seleccionar un tipo de tasa." }),
    
    downPayment: () =>
        z.preprocess(
            cleanNumber,
            z.coerce.number({
                required_error: "Debes ingresar un monto.",
                invalid_type_error:"El monto no es válido.",
            })
        ),
    
    useSimplePersonalInformation: () =>
        z.boolean(),
    
    birthDate: () =>
        z.string({
            required_error: "La fecha de nacimiento es obligatoria.",
        })
        .nonempty("La fecha de nacimiento es obligatoria")
        .refine((value) => !isNaN(new Date(value).getTime()), {
            message: "Fecha inválida.",
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
    
    maritalStatus: ({ options } = {}) =>
        zodSelectField(options),
    
    jobType: ({ options } = {}) =>
        zodSelectField(options, { required: "Debes seleccionar tu ocupación." }),
    
    contractType: ({ options } = {}) =>
        zodSelectField(options, { required: "Debes seleccionar el tipo de contrato." }),

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
    
    assetType: ({ options } = {}) =>
        zodSelectField(options, { required: "Debes seleccionar un tipo de activo." }),
    
    assetValue: () =>
        z.preprocess(
            cleanNumber,
            z.coerce.number({
                required_error: "Debes ingresar el valor del activo.",
                invalid_type_error: "El valor no es válido.",
            })
            .min(1, "Debes ingresar un valor válido."),
        ),

    ownershipPercentage: () =>
        z.preprocess(
            cleanNumber,
            z.coerce.number()
                .min(1, "El porcentaje mínimo es 1%.")
                .max(100, "El porcentaje no puede exceder el 100%."),
        ),

    // source: () =>
    //     z.any()
    //     .refine(
    //         (file) =>
    //             file == null ||
    //             file === "" ||
    //             file instanceof File,
    //         {
    //             message:
    //                 "Debe seleccionar un archivo válido.",
    //         }
    //     )
    //     .refine(
    //         (file) =>
    //             file == null ||
    //             file === "" ||
    //             VALID_FILE_TYPES.includes(file.type),
    //         {
    //             message:
    //                 "Formato inválido, debe ser png, jpeg o pdf.",
    //         }
    //     )
    //     .refine(
    //         (file) =>
    //             file == null ||
    //             file === "" ||
    //             file.size <= 10 * 1024 * 1024,
    //         {
    //             message:
    //                 "El archivo no puede pesar más de 10MB.",
    //         }
    //     ),
        
    // sourceRequired: () =>
    //     z.instanceof(File, {
    //         message: "Debe seleccionar un archivo.",
    //     })
    //     .refine((file) => file.size > 0, {
    //         message: "Archivo inválido.",
    //     })
    //     .refine(
    //         (file) => VALID_FILE_TYPES.includes(file.type),
    //         {
    //             message: "Formato inválido, debe ser png, jpeg o pdf.",
    //         }
    //     )
    //     .refine(
    //         (file) => file.size <= 10 * 1024 * 1024,
    //         {
    //             message: "El archivo no puede pesar más de 10MB.",
    //         }
    //     ),

    document: () =>
        z.any()
        .refine(
            (file) =>
                file == null ||
                file === "" ||
                file instanceof File ||
                file?.uploaded === true,
            {
                message:
                    "Debe seleccionar un archivo válido.",
            }
        )
        .refine(
            (file) =>
                file == null ||
                file === "" ||
                file?.uploaded === true ||
                VALID_FILE_TYPES.includes(file.type),
            {
                message:
                    "Formato inválido, debe ser png, jpeg o pdf.",
            }
        )
        .refine(
            (file) =>
                file == null ||
                file === "" ||
                file.size <= 10 * 1024 * 1024,
            {
                message:
                    "El archivo no puede pesar más de 10MB.",
            }
        ),
    
    documentRequired: () =>
        z.instanceof(File, {
            message: "Debe seleccionar un archivo.",
        })
        .refine((file) => file.size > 0, {
            message: "Archivo inválido.",
        })
        .refine(
            (file) => VALID_FILE_TYPES.includes(file.type),
            {
                message: "Formato inválido, debe ser png, jpeg o pdf.",
            }
        )
        .refine(
            (file) => file.size <= 10 * 1024 * 1024,
            {
                message: "El archivo no puede pesar más de 10MB.",
            }
        ),
    
    documentBackend: () =>
        z.union([
            z.object({
                uploaded: z.literal(true),
                url: z.string(),
                name: z.string(),
            }),
            z.literal(""),
            z.null(),
        ]).optional(),

    documentRequiredBackend: () =>
        z.object({
            uploaded: z.literal(true),
            url: z.string().min(1),
            name: z.string().min(1),
        }, {
            required_error: "Debe seleccionar un archivo.",
            invalid_type_error: "Debe seleccionar un archivo.",
        }),
    
    documentCategory: () =>
        z.string()
            .min(1, "Categoría de documento incompleta.")
            .max(100, "Categoría de documento demasiado larga."),

    select: ({ options } = {}) =>
        zodSelectField(options),

    string: () =>
        z.string()
            .min(1, "Campo incompleto."),
    
    bankId: ({ options } = {}) =>
        zodSelectField(options, { required: "Debes seleccionar un banco." }),

    paymentMethodType: ({ options } = {}) =>
        zodSelectField(options, { required: "Debes seleccionar un tipo de método de pago." }),

    disbursementMethodType: ({ options } = {}) =>
        zodSelectField(options, { required: "Debes seleccionar un tipo de desembolso." }),

    brandType: ({ options } = {}) =>
        zodSelectField(options, { required: "Debes seleccionar una marca." }),

    holderName: () =>
        z.string()
            .min(1, "El nombre del titular es obligatorio.")
            .max(100, "El nombre del titular es demasiado largo."),

    last4: () =>
        z.string()
            .regex(/^\d{4}$/, "Los últimos 4 dígitos deben ser 4 números."),

    alias: () =>
        z.string()
            .min(1, "Alias incompleto.")
            .max(50, "El alias es demasiado largo."),

    address: () =>
        z.string()
            .min(1, "Ingresa tu dirección"),

    commune: () =>
        z.string()
            .min(1, "Ingresa tu comuna"),

    region: () =>
        z.string()
            .min(1, "Ingresa tu región"),
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
        schema.superRefine((data, ctx) => {
            const useSimple = !!data.useSimplePersonalInformation;
            const nationalId = data.nationalId;

            const hasNationalId =
                nationalId !== undefined &&
                nationalId !== null &&
                nationalId !== "" &&
                String(nationalId).trim() !== "";
            
            // console.log(data);

            if (!("nationalId" in data)) {
                if (!useSimple) {
                    ctx.addIssue({
                        path: ["useSimplePersonalInformation"],
                        message: `Debes confirmar el uso de información personal.`
                    });
                }
                return;
            }
            if (useSimple && !hasNationalId) {
                ctx.addIssue({
                    path: ["nationalId"],
                    message: "Rut requerido si confirmas uso de información personal."
                });
            }
            if (hasNationalId && !useSimple) {
                ctx.addIssue({
                    path: ["useSimplePersonalInformation"],
                    message: `Debes confirmar el uso de información personal.`
                });
            }
        }),
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
        ),
    newPassword: () => (schema) =>
        schema.refine(
            ({ password, currentPassword }) => password !== currentPassword,
            {
                message: "La contraseña nueva no puede ser igual a la actual.",
                path: ["password"]
            }
        ),
    newConfirmPassword: () => (schema) =>
        schema.refine(
            ({ password, confirmPassword }) => password === confirmPassword,
            {
                message: "Las contraseñas no coinciden.",
                path: ["confirmPassword"]
            }
        ),
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