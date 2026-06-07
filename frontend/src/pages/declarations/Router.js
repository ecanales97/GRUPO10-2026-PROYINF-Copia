import { Route, Routes } from 'react-router-dom';

import ClientOnlyRoute from 'components/ClientOnlyRoute';

import PATH from 'config/paths';

import Declarations from 'pages/declarations/Declarations';

const DeclarationsRouter = () => {
    return (
        <Routes>
            <Route element={<ClientOnlyRoute/>}>
                <Route index element={<Declarations/>}/>
                <Route path={`${PATH.declarations.declaration.path}/*`} element={<Declarations/>}/>
            </Route>
        </Routes>
    );
}

export default DeclarationsRouter;