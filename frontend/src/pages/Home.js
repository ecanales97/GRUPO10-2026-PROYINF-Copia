import { useNavigate } from "react-router-dom";

import TEXT from "config/texts";

// import { Scan, User, Info, ArrowRight } from 'lucide-react';

import ErrorPage from "pages/ErrorPage";

import Surface from "components/containers/Surface";
import Container from "components/containers/Container";
import Highlights from "components/Highlights";
import PATH from "config/paths";

import { useCredits } from "context/creditsContext";

import { useCatalogs } from "hooks/useCatalogs";

import FillContainer from "components/containers/FillContainer";
import SpinnerGrow from "components/spinners/SpinnerGrow";

const Home = () => {
    const navigate = useNavigate();
    const { loading: creditsLoading, error: creditsError } = useCredits();
    const { loading: catalogsLoading, error: catalogsError } = useCatalogs();

    if (catalogsError || creditsError) return <ErrorPage/>;
    if (catalogsLoading || creditsLoading) return (
        <FillContainer>
            <SpinnerGrow className="text-primary" style={{width: "5rem", height: "5rem"}}/>
        </FillContainer>
    );

    return (
        <Container
            className="fit-flex align-items-center justify-content-center"
        >
            <Container
                className="w-fit"
            >
                <h1 className="display-1 baskervville-italic text-uppercase">
                    {TEXT.home.title}
                </h1>
                <Highlights
                    highlights={TEXT.home.subtitle}
                />
            </Container>
            <Surface
                className="w-100 p-3 rounded-2"
                style={{
                    maxWidth: "768px",
                }}
            >
                <button
                    className="btn btn-primary rounded-1"
                    onClick={() => {
                        navigate(PATH.credits.credit.simulator.build({ creditType:"consumo" }));
                    }}
                >
                    {TEXT.consumption.name}
                </button>
                <button
                    className="btn btn-secondary btn-opacity-25 rounded-1"
                    onClick={() => {
                        navigate(PATH.credits.credit.simulator.build({ creditType:"hipotecario" }));
                    }}
                >
                    {TEXT.mortgage.name}
                </button>
            </Surface>
        </Container>
    )
}

export default Home;