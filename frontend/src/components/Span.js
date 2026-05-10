const Span = ({children, className = "", ...props}) => (
    <span
        className={`d-inline-flex align-items-center gap-1 ${className}`}
        {...props}
    >
        {children}
    </span>
)

export default Span;