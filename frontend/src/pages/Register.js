import { ArrowRight } from "lucide-react";

import { WizardRouter } from "components/renderers/WizardRenderer";

import Span from "components/Span";
import Container from "components/containers/Container";

import { useAuth } from "context/authContext";
import { useCatalogs } from "hooks/useCatalogs";

import TEXT from "config/texts";
import FIELDS from "config/fields";
import PATH from "config/paths";

import {
    objectValidations
} from "shared/schemas/schema";

const Register = ({ path }) => {
    const { register } = useAuth();
    const { catalogs } = useCatalogs();

    const { clientMaritalStatus } = catalogs ?? {};

    const struct = {
        id: "register",
        stepper: true,

        submitButtonText: (
            <Span>
                Crear cuenta
                <ArrowRight size="1rem" />
            </Span>
        ),

        onSubmit: async ({
            formData,
            setSubmitting,
            setStatus,
            navigate
        }) => {
            try {
                const res = await register(formData);
                if (res.ok) {
                    navigate(
                        PATH.login.build(),
                        {
                            replace: true
                        }
                    );

                    return;
                }

                setStatus(res.error);

            } catch (e) {
                console.error(e);
                setSubmitting(false);
            }
        },

        steps: [
            {
                path: "",
                name: "Información personal",
                content: () => (
                    <Container className="w-100">
                        <h1 className="
                            display-2
                            baskervville-italic
                            text-uppercase
                        ">
                            {TEXT.register.title}
                        </h1>
                    </Container>
                ),

                fields: FIELDS(
                    {
                        name: {},
                        nationalIdRequired: {},
                        birthDate: {},
                        maritalStatus: { options: clientMaritalStatus },
                    },
                    {
                        asList: true
                    }
                ),
            },

            {
                path: "contacto",
                name: "Datos de contacto",

                fields: FIELDS(
                    {
                        nickname: {},
                        phone: {},
                        email: {},
                    },
                    {
                        asList: true
                    }
                ),
            },

            {
                path: "seguridad",
                name: "Seguridad",
                validations: objectValidations.registerConfirmPassword(),

                fields: FIELDS(
                    {
                        password: {},
                        confirmPassword: {},
                    },
                    {
                        asList: true
                    }
                ),
            }
        ]
    };

    return WizardRouter(struct,path);
};

export default Register;