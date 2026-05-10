import { Routes, Route } from 'react-router-dom';

import Apply from './Apply';
import PATH from 'config/paths';
import { useCredit } from 'hooks/useCredit';

const ApplyRouter = () => {
    const { pathType } = useCredit()
    return (
        <Routes>
            <Route path="/*" element={<Apply path={PATH.credits.credit.apply.build({ creditType: pathType })}/>} />
        </Routes>
    )
}

export default ApplyRouter;