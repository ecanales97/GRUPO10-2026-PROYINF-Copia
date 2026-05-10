import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ReactComponent as Icon } from "assets/icon.svg";

import { handleNavbarCollapseItems } from "components/subComponents/NavbarCollapseItem";
import { handleNavbarItems } from "./subComponents/NavbarItem";

import { useAuth } from "context/authContext";
import PATH from "config/paths";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();

    // activa y desactiva el scroll en el body
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 992) {
                document.body.classList.remove("overflow-hidden");
            } else if (isOpen) {
                document.body.classList.add("overflow-hidden");
            } else {
                document.body.classList.remove("overflow-hidden");
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isOpen]);

    // esto cierra el navbar al cargar una pagina
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const navbarStruct = {
        main: [
            { title: "Inicio", to: "/" },
            {
                title: "Productos y Servicios",
                elements: [
                    {
                        title: "Creditos",
                        elements: [
                            { title: "Ver creditos", to: PATH.credits.build() },
                            { title: "Credito de consumo", to: PATH.credits.credit.build({ creditType: "consumo" }) },
                            { title: "Credito hipotecario", to: PATH.credits.credit.build({ creditType: "hipotecario" }) }
                        ]
                    },
                    {
                        title: "Simulador",
                        elements: [
                            { title: "Simular credito de consumo", to: PATH.credits.credit.simulator.build({ creditType: "consumo" }) },
                            { title: "Simular credito hipotecario", to: PATH.credits.credit.simulator.build({ creditType: "hipotecario" }) }
                        ]
                    }
                ]
            },
            { title: PATH.scanner.label, to: PATH.scanner.build() },
            { title: PATH.about.label, to: PATH.about.build() },
        ],
        account: [
            ...(isAuthenticated
                ? [
                    {
                        title: user.nickname,
                        elements: [
                            {
                                title: "Perfil",
                                elements: [
                                    { title: "Configurar" },
                                    { title: "Ver mis simulaciones", to: PATH.history.build() },
                                    { title: "Ver mis solicitudes" },
                                    {
                                        title: "Acciones",
                                        elements: [
                                            { title: "Cerrar Sesión", onClick: logout }
                                        ]
                                    }
                                ]
                            },
                            {
                                title: "Mis creditos",
                                elements: [
                                    { title: "Creditos aprobados" },
                                    { title: "Cuotas pendientes" }
                                ]
                            },
                        ]
                    },
                ]
                : [
                    { title: "Iniciar Sesión", to: PATH.login.build() },
                    { title: "Crear Cuenta", to: PATH.register.build() }
                ]
            )
        ]
    };

    return (
        <nav className="navbar navbar-expand-lg bg-body custom-navbar-height border-bottom border-opacity-20 border-primary p-0" style={{
            position: "sticky",
            zIndex: 2000,
            top: 0,
        }}>

            <div
                id="navbar-collapse"
                className={`navbar-collapse bg-body border-start border-opacity-20 border-primary gap-3 ${isOpen ? "show" : ""}`}
            >
                {handleNavbarCollapseItems(navbarStruct.main)}
                {handleNavbarCollapseItems(navbarStruct.account)}
            </div>

            <div className="container-fluid gap-3 px-4 h-100 max-width-1320">
                <Icon
                    className="text-secondary-color cursor-pointer"
                    style={{
                        height: "40px",
                        width: "80px",
                    }}
                    onClick={() => navigate("/")}
                />

                <div
                    className="p-2 cursor-pointer"
                    onClick={() => setIsOpen(prev => !prev)}
                >
                    <button
                        className={`navbar-toggler ${isOpen ? "active" : ""}`}
                        type="button"
                    >
                        <span></span>
                        <span></span>
                    </button>
                </div>
                <div className="justify-content-between d-none d-lg-flex gap-3 h-100 w-100">
                    {handleNavbarItems(navbarStruct.main)}
                    {handleNavbarItems(navbarStruct.account)}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;