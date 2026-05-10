import { Fragment, useEffect, useState } from "react";

import { ReactComponent as Asterisk } from "assets/asterisk.svg";

import Container, { ContainerRow } from "components/containers/Container";
import Span from "components/Span";

const Highlights = ({
    highlights = [],
    minWidthRow = 768,
}) => {
    const [isColumn, setIsColumn] = useState(window.innerWidth < minWidthRow);

    useEffect(() => {
        const handleResize = () => {
            setIsColumn(window.innerWidth < minWidthRow);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [minWidthRow]);

    return (
        <>
            {
                isColumn ?
                <Container className="w-100 gap-3">
                    {
                        highlights.map((text, index) => (
                            <ContainerRow key={index} className="w-100 justify-content-between">
                                <Asterisk />
                                <Span className="space-mono-regular text-uppercase">
                                    {text}
                                </Span>
                                <Asterisk />
                            </ContainerRow>
                        ))
                    }
                </Container>
                :
                <ContainerRow className="w-100 justify-content-between">
                    {
                        highlights.map((text, index) => (
                            <Fragment key={index}>
                                { index === 0 && <Asterisk /> }
                                <Span className="space-mono-regular text-uppercase">
                                    {text}
                                </Span>
                                <Asterisk />
                            </Fragment>
                        ))
                    }
                </ContainerRow>
            }
        </>
    );
};

export default Highlights;