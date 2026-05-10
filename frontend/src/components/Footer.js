import { ReactComponent as Icon } from "assets/icon.svg";

import Container, { ContainerRow } from "components/containers/Container";
import Span from "components/Span";

const Footer = () => {
    return (
        <Container
            className="align-items-center border-top border-primary border-opacity-20 p-4"
        >
            <div className="row w-100 max-width-1320">
                <div className="col-md-4">
                    <Icon
                        className="text-secondary-color"
                        style={{
                            height: "30px",
                            width: "60px",
                        }}
                    />
                </div>
                <div className="col-md-8">
                    <ContainerRow className="justify-content-end w-100">
                        <Container>
                            <Span>Footer</Span>
                        </Container>
                        {/* <Container className="w-fit">
                            <Span>Proyecto</Span>
                            <Span>Inicio</Span>
                            <Span>Sobre nosotros</Span>
                        </Container>
                        <Container className="w-fit">
                            <Span>Proyecto</Span>
                            <Span>Inicio</Span>
                            <Span>Sobre nosotros</Span>
                        </Container> */}
                    </ContainerRow>
                </div>
            </div>
        </Container>
    )
}

export default Footer;