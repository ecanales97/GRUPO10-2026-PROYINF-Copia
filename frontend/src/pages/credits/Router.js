import { Route, Routes } from "react-router-dom";

import PATH from "config/paths";
import CreditRouter from "pages/credits/credit/Router";
import Placeholder from "pages/Placeholder";

const CreditsRouter = () => {
    return (
        <Routes>
            <Route index element={<Placeholder/>} />
            <Route path={`${PATH.credits.credit.path}/*`} element={<CreditRouter/>} />
        </Routes>
    );
}

export default CreditsRouter;