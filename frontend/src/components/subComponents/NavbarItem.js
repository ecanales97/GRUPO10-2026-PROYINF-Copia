import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { ChevronUp, ChevronDown } from 'lucide-react';

import Span from "components/Span";
import { isPathActive } from "utils/general";

const NavbarItem = ({
    title,
    to,
    onClick,
    elements
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    // cerrar al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // se cierra cuando se navega
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const handleClick = () => {
        if (elements) {
            setIsOpen(prev => !prev);
            return;
        }

        if (onClick) return onClick();
        if (to) navigate(to);
    };

    return (
        <div ref={ref}>
            <div
                className="d-flex align-items-center h-100 cursor-pointer"
                onClick={handleClick}
            >
                <Span className={(to ? (isPathActive(location, to) ? "" : "opacity-70") : isOpen ? "" : "opacity-70") + " user-select-none"}>
                    {title}
                </Span>

                {
                    elements && 
                    (
                        isOpen
                        ? <ChevronUp size={12} className="ms-1" />
                        : <ChevronDown size={12} className="ms-1 opacity-70" />
                    )
                }
            </div>

            {elements && isOpen && (
                <div id="navbar-dropdown" className="bg-body border-bottom border-primary border-opacity-20 align-items-center">
                    <div className="d-flex flex-row px-4 py-5 gap-5 max-width-1320 w-100">
                        {elements.map((el, i) => (
                            <NavbarDropdownItem
                                key={i}
                                {...el}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const NavbarDropdownItem = ({
    title,
    to,
    onClick,
    elements
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className={`d-flex flex-column gap-3`}>
            <Span
                className={`${to || onClick ? "cursor-pointer" : ""} ${elements ? "" : to ? isPathActive(location, to) ? "" : "opacity-70" : "opacity-70"} user-select-none`}
                onClick={() => {
                    if (onClick) return onClick();
                    if (to) return navigate(to)
                }}
            >
                {title}
            </Span>

            {
                elements &&
                <div className={`d-flex flex-column gap-3`}>
                    {elements.map((element, i) => (
                        <NavbarDropdownItem
                            key={i}
                            {...element}
                        />
                    ))}
                </div>
            }
        </div>
    )
}

export const handleNavbarItems = (struct) => (
    <div className="d-flex gap-3">
        {struct.map((item, index) => (
            <NavbarItem
                key={index}
                {...item}
            />
        ))}
    </div>
);

export default NavbarItem;