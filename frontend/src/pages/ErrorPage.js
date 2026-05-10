import BtnsContainer from "components/containers/BtnsContainer";
import Container from "components/containers/Container";
import FillContainer from "components/containers/FillContainer";
import Span from "components/Span";
import PATH from "config/paths";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
    const navigate = useNavigate();

    const handleReload = () => {
        window.location.reload();
    };

    const handleGoHome = () => {
        navigate(PATH.index.build());
    };

    return (
        <FillContainer>
            <Container className="d-flex flex-column align-items-center justify-content-center text-center gap-3">
                <h1 className="display-1 baskervville-italic">
                    Error
                </h1>

                <Span>
                    Ocurrió un error al cargar la página.
                </Span>

                <BtnsContainer>
                    <button
                        className="btn btn-secondary btn-opacity-25"
                        onClick={handleGoHome}
                    >
                        Ir al inicio
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleReload}
                    >
                        Recargar
                    </button>
                </BtnsContainer>
            </Container>
        </FillContainer>
    );
};

export default ErrorPage;