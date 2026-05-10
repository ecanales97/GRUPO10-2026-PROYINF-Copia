import { useEffect, useState } from "react";
import React from "react";
import Surface from "./Surface";

/**
 * contenedor para meter botones.
 * 
 * - retorna el contenedor
*/
const BtnsContainer = ({ children, bottomPosition = false, minWidthRow = 768, className = "", ...props }) => {
    const [isColumn, setIsColumn] = useState(window.innerWidth < minWidthRow);

    useEffect(() => {
        const handleResize = () => {
            setIsColumn(window.innerWidth < minWidthRow);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [minWidthRow]);

    const childrenArray = React.Children.toArray(children);
    const total = childrenArray.length;

    const fixedChildren = childrenArray.map((child, index) => {
        let extraClass = "";

        if (isColumn && total > 1) {
            if (index === 0) extraClass = "btn-rounded-top";
            else if (index === total - 1) extraClass = "btn-rounded-bottom";
            else extraClass = "btn-rounded-middle";
        }

        return React.cloneElement(child, {
            className: `
                ${child.props.className || ""} ${extraClass}`.trim(),
            style:isColumn ? {} : {
                width: "fit-content"
            }
        });
    });

    return (
        <div
            className={`d-flex w-100 flex-row-reverse ${bottomPosition ? "rounded-2 p-3" : ""}`}
            style={ bottomPosition ? {
                maxWidth: "100vw",
                position: "fixed",
                bottom: 0,
                left: 0,
                // boxShadow: "0 0 0.75rem var(--bs-body-bg)",
            } : {} }
        >
            <Surface
                className={`${isColumn ? "" : "flex-row-reverse"} rounded-2 p-3 ${className}`}
                style={isColumn ? {
                    width: "100%"
                } : {
                    width: "fit-content"
                }}
                {...props}
            >
                {fixedChildren}
            </Surface>
        </div>
    );
};

export default BtnsContainer;