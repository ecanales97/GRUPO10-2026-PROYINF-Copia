import { useNavigate } from "react-router-dom";

import { ArrowLeft } from 'lucide-react';

import ScannerIA from "components/ScannerCarnet";
import FillContainer from "components/containers/FillContainer";
import BtnsContainer from "components/containers/BtnsContainer";
import Span from "components/Span";

const ScannerPage = () => {
    const navigate = useNavigate();

    return (
        <>
            <FillContainer>
                <div className="w-100" style={{ maxWidth: "800px" }}>
                    <h1 className="display-4 baskervville-italic text-uppercase">Herramienta de Escaneo (testing)</h1>
                    <ScannerIA/>
                </div>
            </FillContainer>
            <BtnsContainer>
                <button className="btn btn-secondary btn-opacity-25" onClick={() => navigate("/")}>
                    <Span>
                        <ArrowLeft size={"1rem"} />
                        Volver al Inicio
                    </Span>
                </button>
            </BtnsContainer>
        </>
    );
};

export default ScannerPage;