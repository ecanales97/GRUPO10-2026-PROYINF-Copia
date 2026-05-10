import { Routes, Route, Outlet, useLocation } from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";

import Navbar from "components/Navbar";
import Footer from "components/Footer";

import Home from "pages/Home";
import About from "pages/About";
import ScannerPage from "pages/ScannerPage";
import Historial from "pages/Historial";
import NotFound from "pages/NotFound";
import Login from "pages/Login";
import Register from "pages/Register";

import CreditsRouter from "pages/credits/Router";

import FillContainer from "components/containers/FillContainer";
import SpinnerGrow from "components/spinners/SpinnerGrow";

import { useCatalogs } from "hooks/useCatalogs";

import PATH from "config/paths";
import ErrorPage from "./ErrorPage";
import { useCredits } from "context/creditsContext";

const PageTransition = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.2,
                    ease: "easeOut",
                }}
                className="container content-height d-flex flex-column py-3 text-color"
            >
                <Outlet />
            </motion.div>
        </AnimatePresence>
    );
};

const Main = ({
    navbar = true,
    animation = true,
    footer = true,
}) => {
    return (
        <>
            {navbar && <Navbar/>}
            {animation && <PageTransition/>}
            {!animation && (
                <div
                    className="container content-height d-flex flex-column py-3 text-color"
                >
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

    if (loadingCatalogs || loadingCredits) return (
        <FillContainer>
            <SpinnerGrow
                className="text-primary"
                style={{
                    width: "5rem",
                    height: "5rem",
                }}
            />
        </FillContainer>
    );

    if (errorCatalogs || errorCredits) return (
        <ErrorPage/>
    );

    return (
        <Routes>
            <Route element={<Main/>}>
                <Route path={PATH.index.build()} element={<Home/>} />
                <Route path={PATH.about.build()} element={<About/>} />
                <Route path={PATH.scanner.build()} element={<ScannerPage/>} />
                <Route path={PATH.history.build()} element={<Historial/>} />
                <Route path="*" element={<NotFound/>}/>
            </Route>
            
            <Route element={<Main animation={false} footer={false}/>}>
                <Route path={`${PATH.credits.build()}/*`} element={<CreditsRouter/>}/>
                <Route path={`${PATH.login.build()}/*`} element={<Login path={PATH.login.build()}/>} />
                <Route path={`${PATH.register.build()}/*`} element={<Register path={PATH.register.build()}/>} />
            </Route>
        </Routes>
    )
}

export default AppRoutes;