import React from "react";

const Span = ({
    children,
    className = "",
    ...props
}) => (
    <span
        className={className}
        {...props}
    >
        {React.Children.map(children, child => {
            if (
                React.isValidElement(child) &&
                typeof child.type !== "string"
            ) {
                return React.cloneElement(child, {
                    className: `
                        ${child.props.className || ""}
                        align-text-bottom
                        me-1
                    `.trim(),
                    style: {
                        verticalAlign: "text-bottom",
                        ...child.props.style
                    }
                });
            }

            return child;
        })}
    </span>
);

export default Span;