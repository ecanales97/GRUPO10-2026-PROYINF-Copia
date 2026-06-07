import FillContainer from "components/containers/FillContainer";
import SpinnerGrow from "components/spinners/SpinnerGrow";

const SpinnerPage = () => (
    <FillContainer>
        <SpinnerGrow
            className="text-primary"
            style={{
                width: "5rem",
                height: "5rem",
            }}
        />
    </FillContainer>
);

export default SpinnerPage;