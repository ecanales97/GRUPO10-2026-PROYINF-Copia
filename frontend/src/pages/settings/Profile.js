import Container, { ContainerRow } from "components/containers/Container";
import Span from "components/Span";

import { Wizard } from "context/wizardContext";
import { useAuth } from "context/authContext";

import { useCatalogs } from "hooks/useCatalogs";
import { useModal } from "hooks/useModal";

import FIELDS from "config/fields";

import { onSubmit } from "utils/general";

import { objectValidations } from "shared/schemas/schema";

const Profile = ({ path }) => {
    const { user } = useAuth();
    const { catalogs } = useCatalogs();

    const confirmPasswordModal = useModal();
    const changePasswordModal = useModal();

    const { clientMaritalStatus = [] } = catalogs ?? {};

    const updateButtonText = "Actualizar";

    const structConfirmPassword = {
        id: "confirm-password",
        useStorage: false,
        submitButtonText: "Confirmar contraseña",
        steps: [
            {
                fields: FIELDS({ currentPassword: {} }, { asList: true })
            }
        ],
        onSubmit: async ({ getFormData }) => confirmPasswordModal.confirm(getFormData()),
    };

    const structChangePassword = {
        id: "change-password",
        useStorage: false,
        submitButtonText: "Cambiar contraseña",
        steps: [
            {
                fields: FIELDS({
                    currentPassword: {},
                    password: {},
                    confirmPassword: {},
                }, { asList: true }),
                validations: [
                    objectValidations.registerConfirmPassword(),
                    objectValidations.newPassword(),
                ],
            }
        ],
        onSubmit: async ({ getFormData }) => changePasswordModal.confirm(getFormData()),
    };

    const structChangePasswordHelper = {
        id: "confirm-password-helper",
        useStorage: false,
        submitButtonText: "Cambiar contraseña",
        steps: [{}],
        onSubmit: async ({ resetForm, setStatus, setFields, getFormData }) => {
            resetForm();
            await onSubmit({
                path: "/me/password",
                method: "PATCH",
                credentials: "include",
                confirmModal: changePasswordModal,
                successMessage: "Contraseña guardada con éxito.",
            })({ setStatus, setFields, getFormData });
        }
    };

    const structIdentity = {
        id: "settings-identity",
        useStorage: false,
        submitButtonText: updateButtonText,
        steps: [
            {
                fields: FIELDS({
                    nickname: { default: user.nickname, placeholder: user.nickname },
                    name: { default: user.name, placeholder: user.name },
                    birthDate: {},
                    maritalStatus: {
                        options: clientMaritalStatus,
                        default: String(user.maritalstatusid),
                    },
                }, { asList: true })
            }
        ],
        onSubmit: onSubmit({
            path: "/me/identity",
            method: "PATCH",
            credentials: "include",
            confirmModal: confirmPasswordModal,
            successMessage: "Identidad actualizada con éxito.",
        }),
    };

    const structContact = {
        id: "settings-contact",
        useStorage: false,
        submitButtonText: updateButtonText,
        steps: [
            {
                fields: FIELDS({
                    email: { default: user.email, placeholder: user.email },
                    phone: { default: user.phone, placeholder: user.phone },
                }, { asList: true })
            }
        ],
        onSubmit: onSubmit({
            path: "/me/contact",
            method: "PATCH",
            credentials: "include",
            confirmModal: confirmPasswordModal,
            successMessage: "Contacto actualizado con éxito.",
        }),
    };

    const Title = ({ children }) => (
        <h1 className="baskervville-regular">
            {children}
        </h1>
    );

    const modalsParams = [
        {
            hook: confirmPasswordModal,
            title: "Confirma tu contraseña",
            struct: structConfirmPassword
        },
        {
            hook: changePasswordModal,
            title: "Cambiar contraseña",
            struct: structChangePassword,
        }
    ];

    const wizardsParams = [
        {
            title: "Identidad",
            struct: structIdentity,
        },
        {
            title: "Contacto",
            struct: structContact,
        },
        {
            title: "Contraseña",
            textHelp: "Para cambiar tu contraseña, deberas utilizar tu contraseña actual.",
            struct: structChangePasswordHelper,
            submitButtonClassName: "btn btn-secondary btn-opacity-25 px-3 py-2 w-fit"
        }
    ];

    return (
        <Container className="gap-3">

            {modalsParams.map((elem, index) =>
                <elem.hook.Modal key={index} title={elem.title} hideFooter={true}>
                    <Wizard struct={elem.struct} path={path}>
                        <Container>
                            <Wizard.Fields />
                            <Wizard.Status />
                            <Wizard.SubmitButton />
                        </Container>
                    </Wizard>
                </elem.hook.Modal>
            )}

            {wizardsParams.map((elem, index) =>
                <Wizard key={index} struct={elem.struct} path={path}>
                    <Container>
                        <Title>{elem.title}</Title>
                        {elem.textHelp && <Span>{elem.textHelp}</Span>}
                        <Wizard.Fields />
                        <ContainerRow className="align-items-center">
                            <Wizard.SubmitButton className={elem.submitButtonClassName ?? "btn btn-primary px-3 py-2 w-fit"} />
                            <Wizard.Status />
                        </ContainerRow>
                    </Container>
                </Wizard>
            )}

        </Container>
    );
};

export default Profile;