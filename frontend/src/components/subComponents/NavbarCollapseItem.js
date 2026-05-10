import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { ChevronUp, ChevronDown } from 'lucide-react';

import Span from "components/Span";
import { isPathActive } from "utils/general";

const NavbarCollapseItem = ({
        title,
        to,
        onClick,
        elements,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                isDropdownOpen &&
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <div ref={containerRef}>
            <div
                className={`d-flex align-items-center w-100 px-4`}
                onClick={() => setIsDropdownOpen(prev => !prev)}
            >
                <Span
                    className={
                        (to
                            ? (isPathActive(location, to) ? "" : "opacity-70") + " cursor-pointer"
                            : "opacity-70"
                        ) + " w-fit user-select-none py-3 h-100"
                    }
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onClick) return onClick();
                        if (to) return navigate(to);
                        if (elements) return setIsDropdownOpen(prev => !prev);
                    }}
                >
                    {title}
                </Span>

                {elements && (
                    <Span className="ms-auto h-100">
                        {
                            isDropdownOpen
                            ?  <ChevronUp size={16}/>
                            : <ChevronDown size={16}/>
                        }
                    </Span>
                )}
            </div>

            {elements &&  (
                <div id="navbar-collapse-dropdown" className={`${isDropdownOpen ? "open" : ""}`}>
                    {elements.map((subElement, index) => (
                        <NavbarCollapseItem
                            key={index}
                            {...subElement}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const handleNavbarCollapseItems = (struct) => (
    <div className="d-flex flex-column w-100">
        {
            struct.map((element, index) => (
                <NavbarCollapseItem
                    key={index}
                    {...element}
                />
            ))
        }
    </div>
);

export default NavbarCollapseItem;