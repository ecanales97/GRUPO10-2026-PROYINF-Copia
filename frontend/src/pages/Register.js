import { ArrowRight } from "lucide-react";
import { WizardRouter } from "components/renderers/WizardRenderer";
import Span from "components/Span";

import { useAuth } from "context/authContext";
import Container from "components/containers/Container";
import TEXT from "config/texts";
import FIELDS from "config/fields";
import PATH from "config/paths";

import { objectValidations } from "shared/schemas/schema";

const Register = ({path}) => {
    const { register } = useAuth();

    const struct = {
        id: "register",
        submitButtonText: (
            <Span>
                Crear cuenta
                <ArrowRight size="1rem" />
            </Span>
        ),

        onSubmit: async ({ formData, setSubmitting, setStatus, navigate }) => {
            try {
                const res = await register(formData);
                if (res.ok) {
                    navigate(PATH.login.build(), { replace: true });
                } else {
                    setStatus(res.error);
                }
            } catch (e) {
                console.error(e);
                setSubmitting(false);
            }
        },

        stepper: true,

        steps: [
            { // 1
                path: "",
                name: "Información personal",
                content: () => {
                    return (
                        <Container className="w-100">
                            <h1 className="display-2 baskervville-italic text-uppercase">
                                {TEXT.register.title}
                            </h1>
                        </Container>
                    );
                },
                fields: FIELDS({
                    name: {},
                    nationalIdRequired: {},
                    nationalities: {},
                    birthDate: {},
                    maritalStatus: {},
                }, { asList: true }),
            }, // 2
            {
                path: "contacto",

                name: "Datos de contacto",
                fields: FIELDS({
                    nickname: {},
                    phone: {},
                    email: {},
                }, { asList: true }),
            }, // 3
            {
                path: "seguridad",

                name: "Seguridad",
                validations: objectValidations.registerConfirmPassword(),
                fields: FIELDS({
                    password: {},
                    confirmPassword: {},
                }, { asList: true }),
            }
        ]
    };

    return WizardRouter(struct, path);
};

export default Register;