import Container from "./Container";

/**
 * contenedor para meter formularios.
 * 
 * - retorna el contenedor
*/
const FormContainer = ({children, className = "", ...props}) => {
    return (
        <Container
            className={`gap-3 fit-flex position-relative ${className}`}
            style={{
                maxWidth: 992,
                width: "100%",
                marginLeft: "auto",
                marginRight: "auto",
            }}
            {...props}
        >
            {children}
        </Container>
    )
}

export default FormContainer;