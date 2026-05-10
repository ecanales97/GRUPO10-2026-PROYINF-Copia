import { validations, defaultData } from "shared/schemas/schema";
import { handleMoney, handleRut, handleTerm } from "utils/handlers";
import { optionsAssets, optionsIncome, optionsJob, optionsMaritalStatus } from "config/options";
import TEXT from "config/texts";

const getFirstPaymentBounds = ({ min, max }) => {
    const today = new Date();

    const minDate = new Date(
        today.getFullYear(),
        today.getMonth() + min,
        today.getDate()
    );

    const maxDate = new Date(
        today.getFullYear(),
        today.getMonth() + max,
        today.getDate()
    );

    return {
        min: minDate.toISOString().split("T")[0],
        max: maxDate.toISOString().split("T")[0],
    };
};

const getBirthDateBounds = () => {
    const today = new Date();

    const maxDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
    );

    const minDate = new Date(
        today.getFullYear() - 100,
        today.getMonth(),
        today.getDate()
    );

    return {
        min: minDate.toISOString().split("T")[0],
        max: maxDate.toISOString().split("T")[0],
    };
};

const FIELDS_BASE = {
    nationalId: () => ({
        id: "nationalId",
        name: "nationalId",
        type: "text",
        validation: validations.nationalId(),
        onChange: handleRut,
    }),

    nationalIdRequired: () => ({
        id: "nationalId",
        name: "nationalId",
        type: "text",
        validation: validations.nationalIdRequired(),
        required: true,
        onChange: handleRut,
    }),

    name: () => ({
        id: "name",
        name: "name",
        type: "text",
        validation: validations.name(),
        required: true,
    }),

    nickname: () => ({
        id: "nickname",
        name: "nickname",
        type: "text",
        validation: validations.nickname(),
        required: true,
    }),

    phone: () => ({
        id: "phone",
        name: "phone",
        type: "text",
        validation: validations.phone(),
        required: false,
    }),

    email: () => ({
        id: "email",
        name: "email",
        type: "email",
        validation: validations.email(),
        required: true,
    }),

    password: () => ({
        id: "password",
        name: "password",
        type: "password",
        validation: validations.password(),
        required: true,
    }),

    confirmPassword: () => ({
        id: "confirmPassword",
        name: "confirmPassword",
        type: "password",
        validation: validations.confirmPassword(),
        required: true,
    }),

    passwordRequired: () => ({
        id: "password",
        name: "password",
        type: "password",
        validation: validations.passwordRequired(),
        required: true,
    }),

    amount: ({ min, max }) => ({
        id: "amount",
        name: "amount",
        type: "text",
        validation: validations.amount({ min, max }),
        required: true,
        onChange: handleMoney,
        max,
    }),

    income: () => ({
        id: "income",
        name: "income",
        type: "select",
        validation: validations.income(),
        required: true,
        options: optionsIncome,
        otherField: {
            type: "text",
            required: true,
            onChange: handleMoney,
        },
    }),

    termMonthly: ({ min, max }) => ({
        id: "termMonthly",
        name: "termMonthly",
        type: "number",
        validation: validations.termMonthly({ min, max }),
        required: true,
        onChange: handleTerm,
        min,
        max,
    }),

    termYears: ({ min, max }) => ({
        id: "termYears",
        name: "termYears",
        type: "number",
        validation: validations.termYears({ min, max }),
        required: true,
        min,
        max,
    }),

    firstPaymentDate: ({ min, max }) => ({
        id: "firstPaymentDate",
        name: "firstPaymentDate",
        type: "date",
        validation: validations.firstPaymentDate({ min, max }),
        default: defaultData.firstPaymentDate({ firstPaymentMonths: min }),
        required: true,
        ...(getFirstPaymentBounds({ min, max })),
    }),

    propertyValue: ({ min, max }) => ({
        id: "itemValue",
        name: "itemValue",
        type: "text",
        validation: validations.propertyValue({ min, max }),
        required: true,
        onChange: handleMoney,
        max,
    }),

    propertyType: () => ({
        id: "itemType",
        name: "itemType",
        type: "select",
        options: [
            { value: "house", label: "Casa" },
            { value: "apartment", label: "Departamento" },
        ],
        validation: validations.propertyType(),
        required: true,
    }),

    rateType: () => ({
        id: "rateType",
        name: "rateType",
        type: "select",
        options: [
            { value: "fixed", label: "Fija" },
            { value: "variable", label: "Variable" },
            { value: "mixed", label: "Mixta" },
        ],
        validation: validations.rateType(),
        required: true,
    }),

    downPayment: ({ min, max }) => ({
        id: "downPayment",
        name: "downPayment",
        type: "text",
        validation: validations.downPayment(),
        required: true,
        onChange: handleMoney,
    }),

    useSimplePersonalInformation: () => ({
        id: "useSimplePersonalInformation",
        name: "useSimplePersonalInformation",
        type: "checkbox",
        validation: validations.useSimplePersonalInformation(),
    }),

    birthDate: () => ({
        id: "birthDate",
        name: "birthDate",
        type: "date",
        required: true,
        validation: validations.birthDate(),
        ...getBirthDateBounds(),
    }),

    maritalStatus: () => ({
        id: "maritalStatusId",
        name: "maritalStatusId",
        type: "select",
        options: optionsMaritalStatus(),
        validation: validations.maritalStatus(),
        required: true,
    }),

    jobs: () => ({
        id: "jobTypeId",
        name: "jobTypeId",
        type: "select",
        options: optionsJob(),
        validation: validations.jobs(),
        required: true,
    }),

    salary: () => ({
        id: "salary",
        name: "salary",
        type: "text",
        validation: validations.salary(),
        onChange: handleMoney,
        required: true,
    }),

    jobStartDate: () => ({
        id: "startDate",
        name: "startDate",
        type: "date",
        validation: validations.jobStartDate(),
        required: true,
    }),

    assetType: () => ({
        id: "assetType",
        name: "assetType",
        type: "select",
        options: optionsAssets(),
        validation: validations.assetType(),
        required: true,
    }),

    assetValue: () => ({
        id: "assetValue",
        name: "assetValue",
        type: "text",
        validation: validations.assetValue(),
        onChange: handleMoney,
        required: true,
    }),
};

const FIELDS = (config = {}, options = {}) => {
    const { asList = false } = options;

    const keys = Object.keys(config).length > 0
        ? Object.keys(config)
        : Object.keys(FIELDS_BASE);

    const entries = keys.map((key) => {
        const fieldFn = FIELDS_BASE[key];
        if (!fieldFn) return null;

        const fieldConfig = config[key] || {};
        const field = fieldFn(fieldConfig);

        const textFn = TEXT.fields?.[key];
        const text = textFn ? textFn(fieldConfig) : {};

        return [
            key,
            {
                ...field,
                label: text.label,
                placeholder: text.placeholder,
                textHelp: text.textHelp,

                ...( (field.otherField || text.otherField) && {
                    otherField: {
                        ...field.otherField,
                        label: text.otherField?.label,
                        placeholder: text.otherField?.placeholder,
                        textHelp: text.otherField?.textHelp,
                    },
                }),
            }
        ];
    }).filter(Boolean);

    return asList
        ? entries.map(([_, field]) => field)
        : Object.fromEntries(entries);
};

export default FIELDS;