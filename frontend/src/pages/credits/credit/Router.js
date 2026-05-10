import { Route, Routes } from "react-router-dom";

import { useCredit } from "hooks/useCredit";

import FillContainer from "components/containers/FillContainer";
import SpinnerGrow from "components/spinners/SpinnerGrow";

import PATH from "config/paths";

import SimulatorRouter from "./simulator/Router";
import ApplyRouter from "./apply/Router";

import NotFound from "pages/NotFound";
import Placeholder from "pages/Placeholder";

const CreditRouter = () => {
    const { credit, loading, error } = useCredit();

    if (loading) {
        return (
            <FillContainer>
                <SpinnerGrow className="text-primary" style={{width: "5rem", height: "5rem"}}/>
            </FillContainer>
        );
    }

    if (error) console.error("Error al intentar obtener la configuracion de los creditos:", error);
    if (!credit || error) return <NotFound/>;

    return (
        <Routes>
            <Route index element={<Placeholder/>} />
            <Route path={`${PATH.credits.credit.simulator.path}/*`} element={<SimulatorRouter/>} />
            <Route path={`${PATH.credits.credit.apply.path}/*`} element={<ApplyRouter/>} />
        </Routes>
    );
}

export default CreditRouter;