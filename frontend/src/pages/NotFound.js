import Container from "components/containers/Container";
import FillContainer from "components/containers/FillContainer";
import Span from "components/Span";
import PATH from "config/paths";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <FillContainer>
            <Container className="align-items-center">
                <h1 className="display-1 baskervville-italic">
                    404
                </h1>
                <Span>
                    Página no encontrada
                </Span>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate(PATH.index.build())}
                >
                    ir al inicio
                </button>
            </Container>
        </FillContainer>
    );
};

export default NotFound;