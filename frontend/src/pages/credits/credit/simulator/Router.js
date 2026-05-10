import { Routes, Route } from 'react-router-dom';

import Simulator from './Simulator';
import PATH from 'config/paths';
import { useCredit } from 'hooks/useCredit';

const SimulatorRouter = () => {
    const { pathType } = useCredit();
    return (
        <Routes>
            <Route path="/*" element={<Simulator path={PATH.credits.credit.simulator.build({ creditType: pathType })}/>} />
        </Routes>
    );
}

export default SimulatorRouter;