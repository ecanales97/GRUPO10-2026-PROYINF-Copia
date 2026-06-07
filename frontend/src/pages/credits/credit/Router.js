import { Route, Routes, Outlet } from "react-router-dom";

import { useCredit } from "hooks/useCredit";

import PATH from "config/paths";

import SimulatorRouter from "./simulator/Router";
import ApplyRouter from "./apply/Router";

import NotFound from "pages/NotFound";
import Placeholder from "pages/Placeholder";

import PageTransition from "components/PageTransition";
import ClientOnlyRoute from "components/ClientOnlyRoute";

const CreditRouter = () => {
    const { credit } = useCredit();
    if (!credit) return <NotFound/>;

    return (
        <Routes>
            <Route element={<PageTransition><Outlet/></PageTransition>}>
                <Route index element={<Placeholder/>} />
            </Route>
            <Route element={<ClientOnlyRoute/>} >
                <Route path={`${PATH.credits.credit.apply.path}/*`} element={<ApplyRouter/>} />
            </Route>
            <Route path={`${PATH.credits.credit.simulator.path}/*`} element={<SimulatorRouter/>} />
        </Routes>
    );
}

export default CreditRouter;