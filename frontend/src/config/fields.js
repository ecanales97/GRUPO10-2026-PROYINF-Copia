import { validations, defaultData } from "shared/schemas/schema";

import {
    handleFile,
    handleMoney,
    handleMoneyGeneral,
    handleRut,
    handleTerm
} from "utils/handlers";

import TEXT from "config/texts";

const VALID_FILES = ".png,.jpg,.jpeg,.pdf";

const getFirstPaymentBounds = ({
    min,
    max
}) => {
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
        min: minDate
            .toISOString()
            .split("T")[0],

        max: maxDate
            .toISOString()
            .split("T")[0],
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
        min: minDate
            .toISOString()
            .split("T")[0],

        max: maxDate
            .toISOString()
            .split("T")[0],
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

    currentPassword: () => ({
        id: "currentPassword",
        name: "currentPassword",
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

    income: ({ options }) => ({
        id: "income",
        name: "income",
        type: "select",

        validation: validations.income({ options }),

        required: true,

        options,

        otherField: {
            type: "text",
            required: true,
            onChange: handleMoney,
        },
    }),

    monthlyIncome: () => ({
        id: "monthlyIncome",
        name: "monthlyIncome",
        type: "text",

        validation: validations.monthlyIncome(),

        onChange: handleMoneyGeneral,

        required: true,
    }),

    incomeType: ({ options } = {}) => ({
        id: "incomeTypeId",
        name: "incomeTypeId",
        type: "select",

        options,

        validation: validations.incomeType({ options }),

        required: true,
    }),

    isRecurring: () => ({
        id: "isRecurring",
        name: "isRecurring",
        type: "checkbox",

        validations: validations.isRecurring(),
        
        default: false,
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

    firstPaymentDate: ({
        min,
        max
    }) => ({
        id: "firstPaymentDate",
        name: "firstPaymentDate",
        type: "date",

        validation: validations.firstPaymentDate({ min, max }),

        default: defaultData.firstPaymentDate({ firstPaymentMonths: min }),

        required: true,

        ...getFirstPaymentBounds({ min, max }),
    }),

    propertyValue: ({
        min,
        max
    }) => ({
        id: "itemValue",
        name: "itemValue",
        type: "text",

        validation: validations.propertyValue({ min, max }),

        required: true,

        onChange: handleMoney,

        max,
    }),

    propertyType: ({ options }) => ({
        id: "itemTypeId",
        name: "itemTypeId",
        type: "select",

        options,

        validation: validations.propertyType({ options }),

        required: true,
    }),

    rateType: ({ options }) => ({
        id: "rateTypeId",
        name: "rateTypeId",
        type: "select",

        options,

        validation: validations.rateType({ options }),

        required: true,
    }),

    downPayment: ({
        min,
        max
    }) => ({
        id: "downPayment",
        name: "downPayment",
        type: "text",

        validation: validations.downPayment({ min, max }),

        onChange: handleMoneyGeneral,

        required: true,
    }),

    useSimplePersonalInformation: () => ({
        id: "useSimplePersonalInformation",
        name: "useSimplePersonalInformation",
        type: "checkbox",

        default: false,

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

    maritalStatus: ({ options }) => ({
        id: "maritalStatusId",
        name: "maritalStatusId",
        type: "select",

        options,

        validation: validations.maritalStatus({ options }),

        required: true,
    }),

    jobType: ({ options }) => ({
        id: "jobTypeId",
        name: "jobTypeId",
        type: "select",

        options,

        validation: validations.jobType({ options }),

        required: true,
    }),

    contractType: ({ options }) => ({
        id: "contractTypeId",
        name: "contractTypeId",
        type: "select",

        options,

        validation: validations.contractType({ options }),

        required: true,
    }),

    salary: () => ({
        id: "salary",
        name: "salary",
        type: "text",

        validation: validations.salary(),

        onChange: handleMoneyGeneral,

        required: true,
    }),

    jobStartDate: () => ({
        id: "startDate",
        name: "startDate",
        type: "date",

        validation: validations.jobStartDate(),

        required: true,
    }),

    assetType: ({ options }) => ({
        id: "assetTypeId",
        name: "assetTypeId",
        type: "select",

        options,

        validation: validations.assetType({ options }),

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

    document: () => ({
        id: "document",
        name: "document",
        type: "file",
        accept: VALID_FILES,

        validation: validations.document(),

        onChange: handleFile,

        required: false,
    }),

    documentRequired: () => ({
        id: "document",
        name: "document",
        type: "file",
        accept: VALID_FILES,

        validation: validations.documentRequired(),

        onChange: handleFile,

        required: true,
    }),

    address: () => ({
        id: "address",
        name: "address",
        type: "text",
        
        validation: validations.address(),

        required: true,
    }),

    city: () => ({
        id: "city",
        name: "city",
        type: "text",
        
        validation: validations.city(),

        required: true,
    }),

    state: () => ({
        id: "state",
        name: "state",
        type: "text",
        
        validation: validations.state(),

        required: true,
    }),
};

const FIELDS = (
    config = {},
    options = {}
) => {
    const {
        asList = false
    } = options;

    const keys =
        Object.keys(config).length > 0
            ? Object.keys(config)
            : Object.keys(FIELDS_BASE);

    const entries = keys
        .map((key) => {
            const fieldFn =
                FIELDS_BASE[key];

            if (!fieldFn) {
                return null;
            }

            const fieldConfig =
                config[key] || {};

            const baseField =
                fieldFn(fieldConfig);

            const textFn =
                TEXT.fields?.[key];

            const text =
                textFn
                    ? textFn(fieldConfig)
                    : {};

            const newParametersField = Object.fromEntries(
                Object.entries(fieldConfig)
                    .filter(([_, value]) =>
                        value !== undefined &&
                        value !== null &&
                        value !== ""
                    )
            );

            return [
                key,
                {
                    ...baseField,

                    label:
                        text.label,

                    placeholder:
                        text.placeholder,

                    textHelp:
                        text.textHelp,

                    ...(
                        (
                            baseField.otherField ||
                            text.otherField
                        ) && {
                            otherField: {
                                ...baseField.otherField,

                                label:
                                    text.otherField?.label,

                                placeholder:
                                    text.otherField?.placeholder,

                                textHelp:
                                    text.otherField?.textHelp,
                            },
                        }
                    ),

                    ...newParametersField,
                }
            ];
        })
        .filter(Boolean);

    return asList
        ? entries.map(
            ([_, field]) => field
        )
        : Object.fromEntries(entries);
};

export default FIELDS;