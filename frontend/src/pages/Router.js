import { Routes, Route, Outlet, useLocation } from "react-router-dom";

import Navbar from "components/Navbar";
import Footer from "components/Footer";

import Home from "pages/Home";
import About from "pages/About";
import ScannerPage from "pages/ScannerPage";
import Historial from "pages/Historial";
import NotFound from "pages/NotFound";
import Login from "pages/Login";
import Register from "pages/Register";

import ErrorPage from "pages/ErrorPage";

import CreditsRouter from "pages/credits/Router";
import SettingsRouter from "pages/settings/Router";
import DeclarationsRouter from "pages/declarations/Router";

import Placeholder from "pages/Placeholder";

import SpinnerPage from "components/spinners/SpinnerPage";
import PageTransition from "components/PageTransition";

import ClientOnlyRoute from "components/ClientOnlyRoute";
// import GuestOnlyRoute from "components/GuestOnlyRoute";

import { useCatalogs } from "hooks/useCatalogs";
import { useCredits } from "context/creditsContext";

import PATH from "config/paths";
import { useAuth } from "context/authContext";

const Main = ({
    navbar = true,
    animation = true,
    footer = true,
}) => {
    const location = useLocation();

    return (
        <>
            {navbar && <Navbar/>}
            {animation ? (
                <PageTransition key={location.pathname}>
                    <Outlet />
                </PageTransition>
            ) : (
                <div className="container content-height d-flex flex-column py-3 text-color">
                    <Outlet />
                </div>
            )}
            {footer && <Footer/>}
        </>
    );
}

const AppRoutes = () => {
    const { loading:loadingCatalogs, error:errorCatalogs } = useCatalogs();
    const { loading:loadingCredits , error:errorCredits } = useCredits();
    const { loading:loadingAuth, error:errorAuth } = useAuth();

    if (loadingCatalogs || loadingCredits || loadingAuth) {
        return <SpinnerPage/>;
    }

    if (errorCatalogs || errorCredits || errorAuth) {
        return <ErrorPage/>;
    }

    // console.log("post");

    return (
        <Routes>
            <Route element={<Main/>}>
                <Route path={PATH.index.path} element={<Home/>} />
                <Route path={PATH.about.path} element={<About/>} />
                <Route path={PATH.scanner.path} element={<ScannerPage/>} />

                <Route path="*" element={<NotFound/>}/>

                <Route element={<ClientOnlyRoute/>}>
                    <Route path={PATH.dashboard.path} element={<Placeholder/>}/>
                    <Route path={PATH.profile.path} element={<Placeholder/>}/>
                    <Route path={PATH.simulations.path} element={<Historial/>} />

                    <Route path={`${PATH.settings.path}/*`} element={<SettingsRouter/>} />
                </Route>
            </Route>
            
            <Route element={<Main animation={false} footer={false}/>}>
                <Route path={`${PATH.login.path}/*`} element={<Login path={PATH.login.build()}/>} />
                <Route path={`${PATH.register.path}/*`} element={<Register path={PATH.register.build()}/>} />
                
                <Route path={`${PATH.declarations.path}/*`} element={<DeclarationsRouter/>}/>
                <Route path={`${PATH.credits.path}/*`} element={<CreditsRouter/>}/>
            </Route>
        </Routes>
    )
}

export default AppRoutes;