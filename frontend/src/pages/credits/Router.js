import { Route, Routes, Outlet } from "react-router-dom";

import PATH from "config/paths";
import CreditRouter from "pages/credits/credit/Router";
import Placeholder from "pages/Placeholder";

import PageTransition from "components/PageTransition";

const CreditsRouter = () => {
    return (
        <Routes>
            <Route element={<PageTransition><Outlet/></PageTransition>}>
                <Route index element={<Placeholder/>} />
            </Route>
            <Route path={`${PATH.credits.credit.path}/*`} element={<CreditRouter/>} />
        </Routes>
    );
}

export default CreditsRouter;