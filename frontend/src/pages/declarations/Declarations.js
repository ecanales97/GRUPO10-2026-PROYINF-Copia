import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText } from 'lucide-react';

import { WizardRouter } from "components/renderers/WizardRenderer";

import PATH from "config/paths";
import FIELDS from "config/fields";

import { useCatalogs } from "hooks/useCatalogs";
import Span from "components/Span";

const Declarations = () => {
    const { catalogs } = useCatalogs();

    const { declarationType } = useParams();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") ?? "/";

    const cancelDeclarationButton = (
        <Span>
            <ArrowLeft size="1rem" />
            {"Cancelar declaración"}
        </Span>
    );

    const submitDeclarationButton = (
        <Span>
            <FileText size="1rem" />
            {"Confirmar declaración"}
        </Span>
    );

    const baseStruct = {
        useBackend: true,

        useRouting: false,

        goHomeButtonText: cancelDeclarationButton,
        submitButtonText: submitDeclarationButton,

        redirectTo: redirectTo,
    }

    const declarationsType = {
        salario: {
            label: "Salario",
            struct: {
                id: "declaration-client-employment",
                backendId: "create-client-employment",
                ...baseStruct,

                steps: [
                    {
                        files: {
                            document: { multiple: false },
                        },
                        fields: FIELDS({
                            document: {},
                        }, { asList: true }),
                    },
                    {
                        fields: FIELDS({
                            jobType: { options: catalogs.jobTypes },
                            contractType: { options: catalogs.contractTypes },
                            salary: {},
                            jobStartDate: {},
                        }, { asList: true }),
                    },
                    {
                        fields: FIELDS({
                            currentPassword: {},
                        }, { asList: true }),
                    }
                ],
            },
        },

        ingreso: {
            label: "Ingreso",
            struct: {
                id: "declaration-client-income",
                backendId: "create-client-income",
                ...baseStruct,
                
                steps: [
                    {
                        files: {
                            document: { multiple: false },
                        },
                        fields: FIELDS({
                            document: {},
                        }, { asList: true }),
                    },
                    {
                        fields: FIELDS({
                            monthlyIncome: {},
                            incomeType: { options: catalogs.incomeTypes },
                            isRecurring: {},
                        }, { asList: true }),
                    },
                    {
                        fields: FIELDS({
                            currentPassword: {},
                        }, { asList: true }),
                    }
                ]
            },
        },

        direccion: {
            label: "Dirección",
            struct: {
                id: "declaration-client-address",
                backendId: "create-client-address",
                ...baseStruct,
                
                steps: [
                    {
                        files: {
                            document: { multiple: false },
                        },
                        fields: FIELDS({
                            document: {},
                        }, { asList: true }),
                    },
                    {
                        fields: FIELDS({
                            address: {},
                            city: {},
                            state: {},
                        }, { asList: true }),
                    },
                    {
                        fields: FIELDS({
                            currentPassword: {},
                        }, { asList: true }),
                    }
                ]
            },
        },
    };

    const declaration = declarationsType[declarationType];
    if (!declaration || Object.keys(declaration.struct).length === 0) return <Navigate to={redirectTo} replace />;

    const fullPath = PATH.declarations.declaration.build({ declarationType });

    return WizardRouter(
        declaration.struct,
        fullPath
    );
};

export default Declarations;