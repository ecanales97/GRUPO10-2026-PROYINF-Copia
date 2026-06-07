import { useLocation } from "react-router-dom";

import { ArrowRight } from "lucide-react";

import { WizardRouter } from "components/renderers/WizardRenderer";

import { useAuth } from "context/authContext";

import Container from "components/containers/Container";
import Span from "components/Span";

import TEXT from "config/texts";
import FIELDS from "config/fields";
import PATH from "config/paths";

const Login = ({path}) => {
    const { login } = useAuth();
    const location = useLocation();
    const from = location.state?.from?.pathname ?? null;

    const struct = {
        id: "login",
        submitButtonText: (
            <Span>
                {TEXT.login.buttons.submit}
                <ArrowRight size="1rem" />
            </Span>
        ),

        onSubmit: async ({ formData, setSubmitting, setStatus, navigate }) => {
            try {
                const res = await login(formData);
                if (res.ok) {
                    navigate(from || PATH.index.build(), { replace: true });
                } else {
                    setStatus(res.error);
                }
            } catch (e) {
                console.error(e);
                setSubmitting(false);
            }
        },

        steps: [
            {
                path: "",
                content: () => {
                    return (
                        <Container className="w-100">
                            <h1 className="display-2 baskervville-italic text-uppercase">
                                {TEXT.login.title}
                            </h1>
                        </Container>
                    );
                },
                fields: FIELDS({
                    nationalIdRequired: {},
                    passwordRequired: {},
                }, { asList: true }),
            }
        ]
    };

    return WizardRouter(struct, path);
};

export default Login;