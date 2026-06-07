import { parseTimestampString } from "utils/parsers";

import { EllipsisVertical } from 'lucide-react';

import BtnsContainer from "components/containers/BtnsContainer";
import Container, { ContainerRow } from "components/containers/Container";
import { SurfaceNoGap } from "components/containers/Surface";
import Span from "components/Span";

const DeclarationRenderer = ({
    items,
    loading,
    error,
    emptyMessage = "No tienes ninguna declaración hecha.",
    renderHeader,
    renderDetails,
    renderFooter,
    actions,
    options,
}) => {
    const LoadingSkeleton = () => (
        <Container className="overflow-hidden">
            <SurfaceNoGap className="placeholder-wave rounded-2">
                <Container className="p-3">
                    <ContainerRow className="placeholder-wave">
                        <Span className="bg-primary rounded-pill placeholder col-7"></Span>
                        <Span className="bg-primary rounded-pill placeholder col-3"></Span>
                    </ContainerRow>
                    <ContainerRow className="placeholder-wave">
                        <Span className="bg-primary rounded-pill placeholder col-4 placeholder-sm"></Span>
                    </ContainerRow>
                </Container>
                <Container className="p-3 border-top border-primary border-opacity-20">
                    <ContainerRow className="placeholder-wave">
                        <Span className="bg-primary rounded-pill placeholder col-4 placeholder-sm"></Span>
                    </ContainerRow>
                    <ContainerRow className="placeholder-wave">
                        <Span className="bg-primary rounded-pill placeholder col-4 placeholder-sm"></Span>
                    </ContainerRow>
                </Container>
            </SurfaceNoGap>
        </Container>
    );

    const EmptyState = ({ message }) => (
        <Container className="overflow-hidden">
            <SurfaceNoGap className="rounded-2">
                <Container className="p-3">
                    <ContainerRow>
                        <Span>{message}</Span>
                    </ContainerRow>
                </Container>
            </SurfaceNoGap>
        </Container>
    );

    const ErrorState = ({ message }) => (
        <Container className="overflow-hidden">
            <SurfaceNoGap className="rounded-2">
                <Container className="p-3">
                    <ContainerRow>
                        <Span>{message}</Span>
                    </ContainerRow>
                </Container>
            </SurfaceNoGap>
        </Container>
    );

    const VerificationBadge = ({ verificationState }) => {
        const colorMap = {
            VERIFIED: "border-success bg-success",
            REJECTED: "border-danger bg-danger",
            PENDING:  "border-warning bg-warning",
        };

        const colorClass = colorMap[verificationState?.code] ?? "border-secondary bg-secondary";

        return (
            <Container
                className={`w-fit bg-opacity-15 border ${colorClass} border-opacity-50 py-1 px-2 rounded-pill align-items-center justify-content-center`}
            >
                <Span
                    className="text-uppercase ibm-plex-mono-regular user-select-none text-nowrap"
                    style={{ fontSize: 10 }}
                >
                    {verificationState?.name ?? "Desconocido"}
                </Span>
            </Container>
        );
    };

    const DeclarationCard = ({ item }) => (
        <SurfaceNoGap className="rounded-2">
            <Container className="p-3">
                <ContainerRow className="align-items-center">
                    {renderHeader(item)}
                    <VerificationBadge verificationState={item.verificationState} />
                    {
                        options && (
                            <div className="ms-auto dropdown">
                                <button data-bs-toggle="dropdown" className="btn border border-primary border-opacity-25 p-2">
                                    <EllipsisVertical size={"1rem"}/>
                                </button>
                                <ul className="dropdown-menu">
                                    {
                                        options.map((opt, index) => {
                                            const { label, onClick } = opt;
                                            return (
                                                <li key={index}>
                                                    <button
                                                        className="dropdown-item"
                                                        onClick={async () => onClick && await onClick({ item: item, loading: loading, error: error, })}
                                                    >
                                                        {label ?? "Opcion"}
                                                    </button>
                                                </li>
                                            );
                                        })
                                    }
                                </ul>
                            </div>
                        )
                    }
                </ContainerRow>
                {renderDetails(item)}
            </Container>
            <Container className="p-3 border-top border-primary border-opacity-20">
                <ContainerRow className="opacity-75">
                    <Span className="small">Fecha de declaración:</Span>
                    <Span className="small">{parseTimestampString(item.createdat)}</Span>
                </ContainerRow>
                {item.updatedat !== item.createdat && (
                    <ContainerRow>
                        <Span className="small">Última actualización:</Span>
                        <Span className="small">{parseTimestampString(item.updatedat)}</Span>
                    </ContainerRow>
                )}
                {renderFooter?.(item)}
            </Container>
        </SurfaceNoGap>
    );

    const Content = () => {
        if (error) return <ErrorState message={error} />;
        if (loading || items === null) return <LoadingSkeleton />;
        if (items?.length === 0) return <EmptyState message={emptyMessage} />;

        return (
            <Container>
                {items.map((item, index) => (
                    <DeclarationCard key={index} item={item} />
                ))}
            </Container>
        );
    };

    return (
        <>
            <Content />
            {actions && (
                <BtnsContainer invertPosition={true}>
                    {actions({ loading: loading || items === null })}
                </BtnsContainer>
            )}
        </>
    );
};

export default DeclarationRenderer;