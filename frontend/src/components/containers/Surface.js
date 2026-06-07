import Container, { ContainerRow, ContainerNoGap, ContainerRowNoGap } from "./Container"

const Surface = ({className = "", ...props}) => (
    <Container
        className={`bg-primary bg-opacity-8 border border-primary border-opacity-20 ${className}`}
        {...props}
    />
);

export const SurfaceRow = ({className = "", ...props}) => (
    <ContainerRow
        className={`bg-primary bg-opacity-8 border border-primary border-opacity-20 ${className}`}
        {...props}
    />
);

export const SurfaceNoGap = ({className = "", ...props}) => (
    <ContainerNoGap
        className={`bg-primary bg-opacity-8 border border-primary border-opacity-20 ${className}`}
        {...props}
    />
);

export const SurfaceRowNoGap = ({className = "", ...props}) => (
    <ContainerRowNoGap
        className={`bg-primary bg-opacity-8 border border-primary border-opacity-20 ${className}`}
        {...props}
    />
);

export default Surface;